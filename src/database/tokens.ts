import { generateToken } from "../util/util";
import { query } from "./database";

const _actions = {
  async createFor(id: number | string, reason: string): Promise<Token> {
    return (
      await query<Token>({
        text: "INSERT INTO tokens (token, account, identifier) VALUES ($1, $2, $3) RETURNING *",
        values: [generateToken(id), id, reason],
      })
    ).rows[0];
  },

  async fetch(token: string): Promise<Token> {
    return (
      await query<Token>({
        text: "SELECT * FROM tokens WHERE token = $1;",
        values: [token],
        noRowsError: {
          message: "Invalid token provded",
          errorCode: "InvalidToken",
        },
      })
    ).rows[0];
  },
} as const;

export default _actions;
