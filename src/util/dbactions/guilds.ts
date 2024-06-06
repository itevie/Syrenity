import { query } from "../database";

export default {
    fetch: async (id: number): Promise<Guild> => {
        return (await query({
            text: `SELECT * FROM guilds WHERE id = $1`,
            values: [id],
            noRowsError: {
                message: `The guild with ID ${id} does not exist`
            }
        })).rows[0] as Guild;
    },

    exists: async (id: number): Promise<boolean> => {
        return (await query({
            text: `SELECT 1 FROM guilds WHERE id = $1`,
            values: [id],
        })).rows.length !== 0;
    },

    hasMember: async (guildId: number, userId: number): Promise<boolean> => {
        return (await query({
            text: `SELECT 1 FROM members WHERE guild_id = $1 AND user_id = $2;`,
            values: [guildId, userId],
        })).rows.length !== 0;
    },

    fetechChannelList: async (id: number): Promise<Channel[]> => {
        return (await query({
            text: `SELECT * FROM channels WHERE guild_id = $1`,
            values: [id],
        })).rows as Channel[];
    },
}