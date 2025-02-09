import { query } from "../database"

export default {
    fetchByToken: async (token: string): Promise<Token> => {
        return (await query({
            text: `SELECT * FROM tokens WHERE token = $1;`,
            values: [token],
            noRowsError: {
                message: "Invalid token provided",
                errorCode: "InvalidToken"
            }
        })).rows[0] as Token;
    },

    createToken: async (token: string, user: number, identifier: string | null = null): Promise<Token> => {
        return (await query({
            text: `
                INSERT INTO tokens (token, account, identifier)
                    VALUES($1, $2, $3)
                    RETURNING *;
            `,
            values: [token, user, identifier]
        })).rows[0] as Token;
    }
}