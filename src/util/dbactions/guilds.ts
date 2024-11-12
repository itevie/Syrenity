import { client, query } from "../database";

export default {
  fetch: async (id: number): Promise<Server> => {
    return (
      await query({
        text: `SELECT * FROM guilds WHERE id = $1`,
        values: [id],
        cache: {
          name: "GuildByID",
          key: id,
        },
        noRowsError: {
          message: `The guild with ID ${id} does not exist`,
        },
      })
    ).rows[0] as Server;
  },

  exists: async (id: number): Promise<boolean> => {
    return (
      (
        await query({
          text: `SELECT 1 FROM guilds WHERE id = $1`,
          values: [id],
          cache: {
            name: "GuildExists",
            key: id,
          },
        })
      ).rows.length !== 0
    );
  },

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

  fetechChannelList: async (id: number): Promise<Channel[]> => {
    return (
      await query({
        text: `SELECT * FROM channels WHERE guild_id = $1`,
        values: [id],
      })
    ).rows as Channel[];
  },

  createChannel: async (id: number, name: string): Promise<Channel> => {
    return (
      await query({
        text: `
                INSERT INTO channels(type, guild_id, name, is_nsfw)
                    VALUES('channel', $1, $2, false)
                    RETURNING *
            `,
        values: [id, name],
      })
    ).rows[0] as Channel;
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
