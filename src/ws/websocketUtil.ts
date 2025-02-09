import expressWs from "express-ws";
import * as uuid from "uuid";
import Logger from "../util/Logger";
import WebsocketHandler from "./WebsocketHandler";
import { WebsocketDispatchTypes } from "./WebsocketDispatchTypes";
import database, { query } from "../database/database";

interface WSConnection {
  uuid: string;
  ws: WebsocketHandler;
  user: User;
}

interface WSSendOptions<T extends keyof WebsocketDispatchTypes> {
  type: T;
  payload: WebsocketDispatchTypes[T];

  guild?: number;
  channel?: number;
}

export const wsLogger = new Logger("ws");
export const connections = new Map<string, WSConnection>();

export async function send<T extends keyof WebsocketDispatchTypes>(
  data: WSSendOptions<T>
) {
  let recipients: number[] = [];
  const connectedIds = Array.from(connections.entries())
    .filter((x) => !!x[1].user)
    .map((x) => x[1].user.id);

  // If there is a guild, find all user's (that are connected) within the guild
  if (data.guild) {
    recipients = (
      await query({
        text: `
                SELECT user_id
                    FROM members
                    WHERE guild_id = $1 AND user_id IN(${connectedIds.join(",")})
            `,
        values: [data.guild],
      })
    ).rows.map((r) => r.user_id);
  }

  connections.forEach((connection) => {
    if (recipients.includes(connection.user.id)) {
      connection.ws.send("Dispatch", {
        guildId: data.guild,
        channelId: data.channel,
        type: data.type,
        payload: data.payload,
      });
    }
  });

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
