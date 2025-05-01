import * as uuid from "uuid";
import { queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";

export interface DatabaseToken {
  token: string;
  account: number;
  created_at: Date;
  identifier: string | null;
}

export type CreateTokenIdentifierHint = "user-session" | "application" | string;

export default class SyToken {
  constructor(public data: DatabaseToken) {}

  public static async fetch(tokenString: string): Promise<SyToken> {
    const token = await queryOne<DatabaseToken>({
      text: "SELECT * FROM tokens WHERE token = $1",
      values: [tokenString],
    });

    if (!token)
      throw new DatabaseError({
        message: "Token not found",
        statusCode: 404,
        errorCode: "NonexistentResource",
      });

    return new SyToken(token);
  }

  public static async createFor(
    account: number,
    identifier: CreateTokenIdentifierHint,
  ): Promise<SyToken> {
    const tokenString = SyToken.generateTokenString(account);

    const token = (await queryOne<DatabaseToken>({
      text: "INSERT INTO tokens (token, account, identifier) VALUES ($1, $2, $3) RETURNING *",
      values: [tokenString, account, identifier],
    })) as DatabaseToken;

    return new SyToken(token);
  }

  public static generateTokenString(id: number) {
    return `${btoa(id.toString())}.${Date.now()}.${uuid.v4()}`;
  }

  toJSON() {
    return this.data;
  }
}
