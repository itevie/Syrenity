import WebSocket from "ws";
import {
  BaseWSMessage,
  IdentifyWSMessage,
  WebsocketType,
} from "./websocketData";
import database from "../database/database";

interface WSConnectionOptions {
  uuid: string;
  onceAuthenticated: (user: User) => void;
  user?: User;
}

export default class WebsocketHandler {
  private ws: WebSocket;
  private data: WSConnectionOptions;

  constructor(data: WSConnectionOptions, ws: WebSocket) {
    this.ws = ws;
    this.data = data;

    this.ws.on("message", (rawMessage) => {
      let message: BaseWSMessage;
      try {
        message = JSON.parse(rawMessage.toString());
      } catch {
        return this.send("Error", {
          error: `Invalid JSON message was sent: ${rawMessage.toString()}`,
        });
      }

      // Check if it is valid
      if (!message.type)
        return this.send("Error", {
          error: `Missing type: ${rawMessage.toString()}`,
        });

      if (!this.operations[message.type])
        return this.basicError("Invalid operation");

      this.operations[message.type](message.payload);
    });

    this.send("Authenticate", {});
  }

  operations = {
    Identify: async (data: IdentifyWSMessage) => {
      console.log(data);
      if (this.data.user) return this.basicError("Already authenticated");
      if (!data.token || typeof data.token !== "string")
        return this.basicError(
          "Token was not provided in authentication payload"
        );

      try {
        const user = await database.users.fetchByToken(data.token);
        this.data.user = user;
        this.data.onceAuthenticated(user);
        this.send("Hello", {
          user,
        });
      } catch (e) {
        return this.basicError(`Failed to authenticate: ${e.message}`);
      }
    },
  };

  private basicError(error: string) {
    this.send("Error", {
      error,
    });
  }

  public send(type: WebsocketType, data: object) {
    this.ws.send(
      JSON.stringify({
        type,
        payload: {
          ...data,
        },
      })
    );
  }
}
