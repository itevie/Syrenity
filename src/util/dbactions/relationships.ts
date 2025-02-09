import { query } from "../database"

export default {
    fetchForChannel: async (id: number): Promise<Relationship> => {
        return (await query({
            text: `SELECT * FROM relationships WHERE channel_id = $1;`,
            values: [id],
            noRowsError: {
                message: `There is no relationship associated with that channel ID`,
                errorCode: "UnknownDatabaseError",
            }
        })).rows[0] as Relationship;
    }
}