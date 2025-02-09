import { query } from "../database"

export default {
    fetch: async (userId: number, guildId: number): Promise<Member> => {
        return (await query({
            text: `SELECT * FROM members WHERE guild_id = $1 AND user_id = $2;`,
            values: [guildId, userId],
            noRowsError: {
                message: `The user ${userId} id not in the guild ${guildId}`
            }
        })).rows[0] as Member;
    },

    addTo: async (userId: number, guildId: number): Promise<Member> => {
        return (await query({
            text: `INSERT INTO members (guild_id, user_id) VALUES ($1, $2) RETURNING *`,
            values: [guildId, userId]
        })).rows[0] as Member;
    },

    hasMember: async (userId: number, guildId: number): Promise<boolean> => {
        return (await query({
            text: `SELECT 1 FROM members WHERE guild_id = $1 AND user_id = $2;`,
            values: [guildId, userId]
        })).rows.length !== 0;
    },

    fetchList: async (guildId: number): Promise<Member[]> => {
        return (await query({
            text: `SELECT * FROM members WHERE guild_id = $1;`,
            values: [guildId],
        })).rows as Member[];
    }
}