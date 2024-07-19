import { query } from "../database"

export default {
    fetch: async (id: string): Promise<Invite> => {
        return (await query({
            text: `SELECT * FROM invites WHERE id = $1;`,
            values: [id],
            noRowsError: {
                message: `The invite ${id} does not exist`,
                errorCode: "NonexistentResource",
            }
        })).rows[0] as Invite;
    },

    exists: async (id: string): Promise<boolean> => {
        return (await query({
            text: `SELECT 1 FROM invites WHERE id = $1;`,
            values: [id],
        })).rows.length !== 0;
    },

    delete: async (id: string): Promise<void> => {
        await query({
            text: `DELETE FROM invites WHERE id = $1`,
            values: [id],
        });
    }
}