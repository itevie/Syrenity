import expressWs from "express-ws";
import * as uuid from "uuid";
import Logger from "../util/Logger";
import WebsocketHandler from "./WebsocketHandler";
import * as database from "../util/database";
import { WebsocketDispatchTypes } from "./WebsocketDispatchTypes";

interface Connection {
  uuid: string;
  wsHandler: WebsocketHandler;
  user: User;
}

export const wsLogger = new Logger("ws");
export const connections = new Map<string, Connection>();

interface WebsocketDispatchOptions<T extends keyof WebsocketDispatchTypes> {
  guildId?: number;
  channelId?: number;

  type: T;
  data: WebsocketDispatchTypes[T];
}

export async function send<T extends keyof WebsocketDispatchTypes>(
  options: WebsocketDispatchOptions<T>
) {
  // Get the IDs of the connections
  let ids = getConnectionUserIds();
  if (ids.length === 0) ids = [-1];

  // Get list of users to send it to
  const result = (
    await database.query({
      text: `
            SELECT user_id
                FROM members
                WHERE guild_id = $1 AND user_id IN(${ids.join(",")})
        `,
      values: [options.guildId],
    })
  ).rows.map((r) => r.user_id);

  // Send it
  connections.forEach((connection) => {
    if (result.includes(connection.user.id)) {
      connection.wsHandler.send({
        op: "DISPATCH",
        t: options.type,
        d: options.data,
      });
    }
  });
}

function getConnectionUserIds(): number[] {
  let ids: number[] = [];

  for (const connection of connections) {
    if (connection[1].user) {
      ids.push(connection[1].user.id);
    }
  }

  return ids;
}

export function initialise(app: expressWs.Application): void {
  app.ws("/", async (ws, req) => {
    const id = uuid.v4();
    wsLogger.log(`CONNECT ${id}`);

    const handler = new WebsocketHandler(id, ws);

    // Check if already logged in
    if (req.user) {
      const user = await database.actions.users.fetch((req.user as User).id);

      // Set the connection
      connections.set(id, {
        uuid: id,
        wsHandler: handler,
        user,
      });

      // Initiate websocket
      handler.init({
        uuid: id,
        user,
        awaitingAuthentication: false,
      });

      wsLogger.log(`COOKIE AUTH: ${id}`);
    } else {
      const onceAuthenticated = (user: User) => {
        // Set the connection
        connections.set(id, {
          uuid: id,
          wsHandler: handler,
          user,
        });

        // Initiate websocket
        handler.init({
          uuid: id,
          user,
          awaitingAuthentication: false,
        });

        wsLogger.log(`TOKEN AUTH: ${id}`);
      };

      handler.init({
        uuid: id,
        awaitingAuthentication: true,
        onceAuthenticated,
      });
    }

    // Handle close
    ws.onclose = () => {
      connections.delete(id);
      wsLogger.log(`DISCONNECT ${id}`);
    };
  });
}
