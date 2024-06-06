import { query } from "../database"

export default {
    fetchByToken: async (token: string): Promise<Application> => {
        return (await query({
            text: `SELECT * FROM applications WHERE token = $1`,
            values: [token],
            noRowsError: {
                message: `There is no application with the specified token`
            }
        })).rows[0] as Application;
    }
}