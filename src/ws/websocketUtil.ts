import expressWs from "express-ws";
import * as uuid from "uuid";
import Logger from "../util/Logger";
import WebsocketHandler from "./WebsocketHandler";

interface WSConnection {
  uuid: string;
  ws: WebsocketHandler;
  user: User;
}

export const wsLogger = new Logger("ws");
export const connections = new Map<string, WSConnection>();

export async function send(...rest: any[]) {
  return;
}

export function initialise(app: expressWs.Application) {
  app.ws("/ws", async (ws, req) => {
    const id = uuid.v4();
    wsLogger.log(`Connect ${id}`);

    const handler = new WebsocketHandler(
      {
        uuid: id,
        onceAuthenticated: (user) => {
          connections.set(id, {
            uuid: id,
            user,
            ws: handler,
          });
        },
      },
      ws
    );

    ws.onclose = () => {
      wsLogger.log(`Disconnect ${id}`);
      connections.delete(id);
    };
  });
}
