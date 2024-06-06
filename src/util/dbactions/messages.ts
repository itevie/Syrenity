import { query } from "../database";

export default {
    fetch: async (id: number): Promise<Message> => {
        return (await query({
            text: `SELECT * FROM messages WHERE id = $1`,
            values: [id],
            noRowsError: {
                message: `The message with ID ${id} does not exist`
            }
        })).rows[0] as Message;
    },

    exists: async (id: number): Promise<boolean> => {
        return (await query({
            text: `SELECT 1 FROM messages WHERE id = $1`,
            values: [id],
        })).rows.length !== 0;
    },
}