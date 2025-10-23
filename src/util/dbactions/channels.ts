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
};
