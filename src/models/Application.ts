import { query, queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import SyUser from "./User";

export interface DatabaseApplication {
  id: number;
  token: string;
  application_name: string;
  bot_account: number;
  owner_id: number;
  created_at: Date;
}

export type ExpandedApplication = DatabaseApplication & {
  bot: SyUser;
  owner: SyUser;
};

export default class SyApplication {
  constructor(public data: DatabaseApplication) {}

  public async expand(): Promise<ExpandedApplication> {
    return {
      ...this.data,
      bot: await SyUser.fetch(this.data.bot_account),
      owner: await SyUser.fetch(this.data.owner_id),
    };
  }

  public static async fetchUsersApplications(
    userId: number,
  ): Promise<SyApplication[]> {
    return (
      await query<DatabaseApplication>({
        text: "SELECT * FROM applications WHERE owner_id = $1",
        values: [userId],
      })
    ).rows.map((x) => new SyApplication(x));
  }

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
