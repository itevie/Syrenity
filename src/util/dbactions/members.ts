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

    fetchList: async (guildId: number): Promise<Member[]> => {
        return (await query({
            text: `SELECT * FROM members WHERE guild_id = $1;`,
            values: [guildId],
        })).rows as Member[];
    }
}