import { query } from "../database/database";

export interface DatabaseProxyUser {
  id: number;
  username: string;
  avatar: string | null;
  owner_id: number | null;
  created_at: Date;
}

export default class SyProxyUser {
  public constructor(public data: DatabaseProxyUser) {}

  public static async fetch(id: number): Promise<SyProxyUser> {
    return new SyProxyUser(
      (
        await query<DatabaseProxyUser>({
          text: "SELECT * FROM proxy_users WHERE id = $1",
          values: [id],
        })
      ).rows[0],
    );
  }

  toJSON() {
    return this.data;
  }
}
