import WebSocket from 'ws';
import Logger from '../Logger';
import opCodes from './opCodes';
import * as database from '../database';
import config from '../config.json';
import ServerError from '../ServerError';

interface WebsocketConnectionInitOptions {
  uuid: string;
  awaitingAuthentication: boolean;
  onceAuthenticated?: (user: User) => void;
  user?: User;
}

/**
 * Class to handle a individual WS connection
 */
export default class WebsocketConnection {
  public ws: WebSocket;

  private id: string;
  private logger: Logger;
  private data: WebsocketConnectionInitOptions | null = null;

  private heartbeatInterval = 0;
  private lastHeartbeat = 0;
  private expectNextHeartbeat = 0;

  constructor(id: string, ws: WebSocket, logger: Logger) {
    // Set the data
    this.id = id;
    this.ws = ws;
    this.logger = logger;

    // Initialise
    this.registerEvents();
  }

  /**
   * Registers all the events
   */
  private registerEvents() {
    for (const i in this.events) {
      this.ws.on(i, this.events[i as keyof typeof this.events]);
    }
  }

  /**
   * Sends JSON data to the client
   * @param data 
   */
  send(data: object) {
    this.ws.send(JSON.stringify(data));
  }

  computeNextHeartbeat() {
    return Date.now() + this.heartbeatInterval;
  }

  /**
   * Holds all the event listeners for the WS connection
   */
  events = {
    message: (message: string) => {
      // Try parse
      try {
        const data = JSON.parse(message);

        if (data.op && this.op[data.op]) {
          this.op[data.op as number](data);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  op = {
    [opCodes.AUTHENTICATE]: async (data: {d: {token: string}}) => {
      try {
        this.logger.log(`WS Authenticate`);
        
        // Check if token exists
        if (!data?.d?.token) {
          return this.handleError(new ServerError({
            message: `You must provide a token in d`,
            error: new Error()
          }), 400);
        }

        // Try fetch application
        const application = await database.actions.applications.fetchByToken(data.d.token);
      
        // Fetch the user
        const user = await database.actions.users.fetchFull(application.bot_account);

        if (this.data?.onceAuthenticated) {
          this.data.onceAuthenticated(user);
        }
      } catch (err) {
        this.handleError(err, 401);
      }
    }
  };

  public handleError(error: Error, overrideStatusCode: number | null = null) {
    const sendingData = {
      message: "Unknown Error",
      statusCode: overrideStatusCode || 500
    };

    if (error instanceof ServerError) {
      // Check message
      if (error.details.safeMessage)
        sendingData.message = error.details.safeMessage;
      else sendingData.message = error.details.message;

      // Check for status code
      if (error.details.statusCode && overrideStatusCode)
        sendingData.statusCode = error.details.statusCode;
    } else {
      sendingData.message = error.message;
    }

    // Send error
    this.send({
      op: opCodes.ERROR,
      d: {
        fatal: true,
        error: sendingData
      }
    });
  }

  /**
   * Initiates the WS connection
   * @param options 
   */
  public async init(options: WebsocketConnectionInitOptions) {
    // Set options
    this.heartbeatInterval = config.server.ws.heartbeat_interval;
    this.data = options;

    // Check if it is awaiting authentication
    if (options.awaitingAuthentication) {
      this.send({
        op: opCodes.AUTHENTICATE,
        d: {
          heartbeat_interval: this.heartbeatInterval
        }
      });
    } else {
      // The user is already logged in
      this.expectNextHeartbeat = this.computeNextHeartbeat();

      // Send as much details as possible to avoid unneeded HTTP requests
      this.send({
        op: opCodes.HELLO,
        d: {
          heartbeat_interval: this.heartbeatInterval,
          user: this.data.user ? this.data.user : null,
          guilds: this.data.user ? await database.actions.users.fetchGuilds(this.data.user.id) : null,
        }
      });
    }
  }
}