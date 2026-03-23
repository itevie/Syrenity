import expressWs from "express-ws";
import * as uuid from "uuid";
import Logger from "../util/Logger";
import WebsocketHandler from "./WebsocketHandler";
import { WebsocketDispatchTypes } from "./WebsocketDispatchTypes";
import { query } from "../database/database";
import SyUser from "../models/User";
import { setInterval } from "node:timers";
import config from "../config";
import SyCustomStatus from "../models/CustomStatus";

interface WSConnection {
  uuid: string;
  ws: WebsocketHandler;
  user: SyUser;
}

interface WSSendOptions<T extends keyof WebsocketDispatchTypes> {
  type: T;
  payload: WebsocketDispatchTypes[T];

  user?: number;
  guild?: number;
  channel?: number;
  recipients?: number[];
}

export const wsLogger = new Logger("ws");
export const connections = new Map<string, WSConnection>();

setInterval(() => {
  wsLogger.log(
    `Attempting to send heartbeat to ${connections.size} connections`
  );
  for (const connection of connections) {
    connection[1].ws.send("Heartbeat", {});
  }
}, config.ws.heartbeatInterval);

/**
 * Sends a message to all connected ws clients
 * @param data The data to send
 */
export async function send<T extends keyof WebsocketDispatchTypes>(
  data: WSSendOptions<T>
): Promise<void> {
  let recipients: number[] = data.recipients ?? [];
  const connectedIds = Array.from(connections.entries())
    .filter((x) => !!x[1].user)
    .map((x) => x[1].user.data.id);

  if (connectedIds.length === 0) return;

  // If there is a guild, find all user's (that are connected) within the guild
  if (data.guild) {
    recipients = [
      ...recipients,
      ...(
        await query<{ user_id: number }>({
          text: `
            SELECT user_id
            FROM members
            WHERE guild_id = $1
            AND user_id = ANY($2)
          `,
          values: [data.guild, connectedIds],
        })
      ).rows.map((r) => r.user_id),
    ];
  } else if (data.user) {
    recipients = [
      ...recipients,
      ...(
        await query<{ user_id: number }>({
          text: `
            SELECT u.id AS user_id
            FROM users u
            WHERE u.id = ANY($2)
            AND (
              EXISTS (
                SELECT 1
                FROM relationships r
                WHERE
                  (r.user1 = $1 AND r.user2 = u.id)
                  OR
                  (r.user1 = u.id AND r.user2 = $1)
              )
              OR
              EXISTS (
                SELECT 1
                FROM members m1
                JOIN members m2
                  ON m1.guild_id = m2.guild_id
                WHERE
                  m1.user_id = $1
                  AND m2.user_id = u.id
              )
            )
          `,
          values: [data.user, connectedIds],
        })
      ).rows.map((r) => r.user_id),
    ];
  } else {
    recipients = [...recipients, ...connectedIds];
  }

  wsLogger.log(
    `Sending Dispatch: ${data.type} to ${recipients.length} recipients`
  );

  connections.forEach((connection) => {
    if (recipients.includes(connection.user.data.id)) {
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
    let u: SyUser;

    const handler = new WebsocketHandler(
      {
        uuid: id,
        onceAuthenticated: async (user) => {
          u = user;
          connections.set(id, {
            uuid: id,
            user,
            ws: handler,
          });

          let customStatus = await SyCustomStatus.fetch(user.data.id, true);

          if (customStatus.data.visibility != "invisible")
            customStatus = await customStatus.edit({ last_seen: new Date() });

          send({
            user: customStatus.data.user_id,
            type: "UserStatusUpdate",
            payload: { status: customStatus.data },
          });
        },
      },
      ws
    );

    ws.onclose = async () => {
      wsLogger.log(`Disconnect ${id}`);
      connections.delete(id);

      let customStatus = await SyCustomStatus.fetch(u.data.id, true);

      if (customStatus.data.visibility != "invisible")
        customStatus = await customStatus.edit({ last_seen: new Date() });

      send({
        user: customStatus.data.user_id,
        type: "UserStatusUpdate",
        payload: { status: customStatus.data },
      });
    };
  });
}
