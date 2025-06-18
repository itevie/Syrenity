import { DatabaseMessage } from "../../models/Message";
import { actions, query } from "../database";

export interface FetchMessageOptions {
  amount?: number | null;
  startAtId?: number | null;
  oldestFirst?: boolean | null;
  isPinned?: boolean | null;
  fromAuthor?: number | null;
}

export default {
  fetch: async (id: number): Promise<Channel> => {
    return (
      await query({
        text: `SELECT * FROM channels WHERE id = $1`,
        values: [id],
        cache: {
          name: "ChannelByID",
          key: id,
        },
        noRowsError: {
          message: `The channel with ID ${id} does not exist`,
        },
      })
    ).rows[0] as Channel;
  },

  exists: async (id: number): Promise<boolean> => {
    return (
      (
        await query({
          text: `SELECT 1 FROM channels WHERE id = $1`,
          cache: {
            name: "ChannelExists",
            key: id,
          },
          values: [id],
        })
      ).rows.length !== 0
    );
  },

  fetchRoleOverride: async (
    channelId: number,
    roleId: number,
  ): Promise<ChannelRoleOverride | null> => {
    return (
      ((
        await query({
          text: `SELECT * FROM channel_role_overrides WHERE channel_id = $1 AND role_id = $2`,
          values: [channelId, roleId],
        })
      ).rows[0] as ChannelRoleOverride) ?? null
    );
  },

  fetchMessages: async (
    channelId: number,
    options: FetchMessageOptions,
  ): Promise<DatabaseMessage[]> => {
    const q = `
            SELECT * FROM messages
                WHERE channel_id = ${channelId}
                    ${options.startAtId ? `AND id < ${options.startAtId}` : ""}
                    ${options.isPinned !== null ? `AND is_pinned = ${options.isPinned}` : ""}
                    ${options.fromAuthor ? `AND author_id = ${options.fromAuthor}` : ""}
                ORDER BY created_at ${options.oldestFirst ? "ASC" : "DESC"}
                LIMIT ${options.amount ?? 20}
        `;

    return (
      await query({
        text: q,
        values: [],
      })
    ).rows as DatabaseMessage[];
  },

  setName: async (channelId: number, newName: string): Promise<Channel> => {
    return (
      await query({
        text: `UPDATE channels SET name = $1 WHERE id = $2 RETURNING *`,
        values: [newName.trim(), channelId],
        cache: {
          clear: {
            names: ["ChannelByID"],
            keys: [channelId],
          },
        },
      })
    ).rows[0] as Channel;
  },

  setTopic: async (channelId: number, newTopic: string): Promise<Channel> => {
    return (
      await query({
        text: `UPDATE channels SET topic = $1 WHERE id = $2 RETURNING *`,
        values: [newTopic.trim(), channelId],
        cache: {
          clear: {
            names: ["ChannelByID"],
            keys: [channelId],
          },
        },
      })
    ).rows[0] as Channel;
  },
};
