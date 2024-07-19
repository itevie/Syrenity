import WebSocket from "ws";
import config from "../config.json";
import * as database from "../util/database";
import { Operation } from "./opCodes";
import { WSClientAuthenticate } from "./WebsocketMessages";
import { WebsocketDispatchTypes } from "./WebsocketDispatchTypes";

interface WebsocketConnectionInitOptions {
    uuid: string;
    awaitingAuthentication: boolean;
    onceAuthenticated?: (user: User) => void;
    user?: User;
}

interface BaseSend {
    op: Operation,
    t?: keyof WebsocketDispatchTypes,
    d: object,
}

export default class WebsocketHandler {
    private uuid: string;
    private ws: WebSocket;
    private data: WebsocketConnectionInitOptions;

    constructor(id: string, ws: WebSocket) {
        this.uuid = id;
        this.ws = ws;

        this.ws.on("message", rawMessage => {
            let message: any;
            try {
                message = JSON.parse(rawMessage.toString());
            } catch {
                this.send({
                    op: "ERROR",
                    d: {
                        error: `Invalid JSON message was sent: ${rawMessage.toString()}`
                    }
                });

                return;
            }

            // Check for OP
            if (!message.op) {
                return this.basicError(`Missing operation: ${rawMessage.toString()}`);
            }

            // Check if valid op
            if (!this.operations[message.op]) {
                return this.basicError(`Invalid operation: ${message.op}`);
            }

            // Check for d
            if (!message.d) {
                return this.basicError(`Missing d field: ${rawMessage.toString()}`);
            }

            // Execute
            this.operations[message.op](message.d);
        });
    }

    operations = {
        "AUTHENTICATE": async (data: WSClientAuthenticate) => {
            // Check if already authenticated
            if (this.data.user) {
                return this.basicError(`Already authenticated`);
            }

            // Check if token is present
            if (!data.token) {
                return this.basicError(`Token was not provided in AUTHENTICATE`);
            }

            try {
                // Attempt to fetch the application
                const application = await database.actions.applications.fetchByToken(data.token);
                const user = await database.actions.users.fetch(application.bot_account);

                // Done
                if (this.data.onceAuthenticated) {
                    this.data.onceAuthenticated(user);
                }
            } catch {
                return this.basicError(`Invalid token provided`);
            }
        }
    }

    /**
     * Sends the JSON data to the client
     * @param data What to send
     */
    public send(data: BaseSend) {
        this.ws.send(JSON.stringify(data));
    }

    public basicError(message: string) {
        this.send({
            op: "ERROR",
            d: {
                message
            }
        });
    }

    /**
     * Initiates the websocket connection
     * @param options The connection options
     */
    public async init(options: WebsocketConnectionInitOptions): Promise<void> {
        this.data = options;

        // Check if the user is already logged in
        if (!options.awaitingAuthentication) {
            // Send details to the client
            this.send({
                op: "HELLO",
                d: {
                    heartbeat_interval: config.ws.heartbeat_interval,
                    user: this.data.user ?? null,
                    guilds: this.data.user
                        ? await database.actions.users.fetchGuilds(this.data.user.id)
                        : []
                }
            });
        } else {
            // Ask the connection to authenticate via token
            this.send({
                op: "AUTHENTICATE",
                d: {
                    heartbeat_interval: config.ws.heartbeat_interval,
                }
            });
        }
    }
}
