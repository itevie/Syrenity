import { generateToken } from "../util/util";
import { Database } from "./database";

export default class DatabaseTokens {
  public db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async createFor(id: number | string, reason: string): Promise<Token> {
    return (
      await this.db.query<Token>({
        text: "INSERT INTO tokens (token, account, identifier) VALUES ($1, $2, $3) RETURNING *",
        values: [generateToken(id), id, reason],
      })
    ).rows[0];
  }

  public async fetch(token: string): Promise<Token> {
    return (
      await this.db.query<Token>({
        text: "SELECT * FROM tokens WHERE token = $1;",
        values: [token],
        noRowsError: {
          message: "Invalid token provded",
          errorCode: "InvalidToken",
        },
      })
    ).rows[0];
  }
}
