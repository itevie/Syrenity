import { query } from "../database"

export default {
    create: async (name: string): Promise<File> => {
        return (await query({
            text: `INSERT INTO files(file_name) VALUES ($1) RETURNING *`,
            values: [name],
        })).rows[0] as File;
    },

    get: async (id: string): Promise<File> => {
        return (await query({
            text: `SELECT * FROM files WHERE id = $1`,
            values: [id],
        })).rows[0] as File;
    },
}