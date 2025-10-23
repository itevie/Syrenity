import { client, query } from "../database";

export default {
  hasMember: async (guildId: number, userId: number): Promise<boolean> => {
    return (
      (
        await query({
          text: `SELECT 1 FROM members WHERE guild_id = $1 AND user_id = $2;`,
          values: [guildId, userId],
          cache: {
            name: "GuildHasMember",
            key: [guildId, userId],
          },
        })
      ).rows.length !== 0
    );
  },

  deleteChannel: async (id: number): Promise<void> => {
    await query({
      text: `
                DELETE FROM messages WHERE channel_id = ${id};
                DELETE FROM channel_role_overrides WHERE channel_id = ${id};
                DELETE FROM channels WHERE id = ${id};
            `,
      values: [],
      cache: {
        clear: {
          names: ["ChannelByID", "ChannelExists"],
          keys: [id],
        },
      },
    });
  },
};
