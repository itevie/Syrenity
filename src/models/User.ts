import { query, queryOne } from "../database/database";
import bcrypt from "bcrypt";
import AuthenticationError from "../errors/AuthenticationError";
import SyRelationship, {
  DatabaseRelationship,
  ExpandedRelationship,
} from "./Relationship";

export interface DatabaseUser {
  id: number;
  username: string;
  password: string;
  email: string;
  email_verified: boolean;
  discriminator: number;
  avatar: string;
  created_at: Date;
  is_bot: boolean;
  bio: string;
}

export type StrippedDatabaseUser = Omit<DatabaseUser, "password" | "email">;

export interface EditUserOptions {
  avatar?: string;
}

export default class SyUser {
  public data: StrippedDatabaseUser;
  public fullData: DatabaseUser;

  constructor(data: DatabaseUser) {
    this.fullData = data;
    const { password, email, ...rest } = data;
    this.data = rest;
  }

  public async fetchServers(): Promise<Server[]> {
    return (
      await query<Server>({
        text: `
        WITH guild_ids AS (
            SELECT guild_id
            FROM members
            WHERE user_id = $1
        )
        
        SELECT * 
            FROM guilds 
            WHERE (
                SELECT 1 
                    FROM guild_ids 
                    WHERE guild_id = guilds.id
            ) = 1`,
        values: [this.data.id],
      })
    ).rows;
  }

  public async fetchRelationships(): Promise<SyRelationship[]> {
    return (
      await query<DatabaseRelationship>({
        text: "SELECT * FROM relationships WHERE user1 = $1 OR user2 = $1",
        values: [this.data.id],
      })
    ).rows.map((x) => new SyRelationship(x));
  }

  public async fetchExpandedRelationships(): Promise<ExpandedRelationship[]> {
    const old = await this.fetchRelationships();
    const newRelationships: ExpandedRelationship[] = [];
    for await (const o of old) newRelationships.push(await o.expand());
    return newRelationships;
  }

  public async edit(options: EditUserOptions) {
    const setClause = Object.entries(options)
      .map((x, i) => `${x[0]} = $${i + 2}`)
      .join(", ");

    const queryText = `
      UPDATE users 
      SET ${setClause} 
      WHERE id = $1 
      RETURNING *;
    `;

    const values = [this.data.id, ...Object.values(options)];

    const result = await query<DatabaseUser>({
      text: queryText,
      values: values,
    });

    return new SyUser(result.rows[0]);
  }

  public static async exists(id: number): Promise<boolean> {
    return (
      (await queryOne<DatabaseUser>({
        text: "SELECT * FROM users WHERE id = $1",
        values: [id],
      })) !== null
    );
  }

  public static async fetch(id: number): Promise<SyUser> {
    return new SyUser(
      await queryOne<DatabaseUser>({
        text: "SELECT * FROM users WHERE id = $1",
        values: [id],
        noRowsError: {
          message: `User ${id} does not exist`,
        },
      })
    );
  }

  public static async fetchByEmail(email: string): Promise<SyUser> {
    return new SyUser(
      await queryOne<DatabaseUser>({
        text: "SELECT * FROM users WHERE id = $1",
        values: [email],
        noRowsError: {
          message: `Email does not exist`,
        },
      })
    );
  }

  public static async fetchByEmailAndPassword(
    email: string,
    password: string
  ): Promise<SyUser> {
    const user = await SyUser.fetchByEmail(email);
    if (!(await bcrypt.compare(password, user.fullData.password))) {
      throw new AuthenticationError({
        errorCode: "NotLoggedIn",
        message: "Not logged in",
        statusCode: 401,
      });
    }

    return user;
  }
}
