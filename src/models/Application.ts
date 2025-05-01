import { queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";

export interface DatabaseApplication {
  id: number;
  token: string;
  application_name: string;
  bot_account: number;
  owner_id: number;
  created_at: Date;
}

export default class SyApplication {
  constructor(public data: DatabaseApplication) {}

  public static async fetchByToken(token: string) {
    const result = await queryOne<DatabaseApplication>({
      text: "SELECT * FROM applications WHERE token = $1",
      values: [token],
    });

    if (result === null)
      throw new DatabaseError({
        message: `Application with that token does not exist`,
        errorCode: "NonexistentResource",
        statusCode: 404,
      });

    return new SyApplication(result);
  }

  toJSON() {
    return this.data;
  }
}
