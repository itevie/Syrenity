import { query, queryOne } from "../database/database";
import bcrypt from "bcrypt";
import AuthenticationError from "../errors/AuthenticationError";
import SyRelationship, {
  DatabaseRelationship,
  ExpandedRelationship,
} from "./Relationship";
import DatabaseError from "../errors/DatabaseError";
import { randomRange } from "../util/util";
import SyToken from "./Token";

export interface DatabaseUser {
  id: number;
  username: string;
  password: string;
  email: string;
  email_verified: boolean;
  avatar: string | null;
  created_at: Date;
  is_bot: boolean;
  bio: string;
  profile_banner: string | null;
}

/**
 * This should only be sent in a context where it is needed
 */
export type StrippedDatabaseUser = Omit<DatabaseUser, "password" | "email">;

export interface EditUserOptions {
  avatar?: string;
  profile_banner?: string;
  about_me?: string;
  username?: string;
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

  public async edit(options: EditUserOptions): Promise<SyUser> {
    // Special ones
    if (options.username) {
      if (await SyUser.usernameExists(options.username))
        throw new DatabaseError({
          message: "This username already exists",
          statusCode: 400,
          errorCode: "Conflict",
        });
    }

    const setClause = Object.entries(options)
      .map((x, i) => `${x[0]} = $${i + 2}`)
      .join(", ");
    if (setClause.length === 0) return this;

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
        ignoreErrors: true,
      })) !== null
    );
  }

  public static async emailExists(email: string): Promise<boolean> {
    return (
      (await queryOne<DatabaseUser>({
        text: "SELECT * FROM users WHERE email = $1",
        values: [email],
        ignoreErrors: true,
      })) !== null
    );
  }

  public static async fetch(id: number): Promise<SyUser> {
    const result = await queryOne<DatabaseUser>({
      text: "SELECT * FROM users WHERE id = $1",
      values: [id],
    });

    if (result === null)
      throw new DatabaseError({
        message: `User ${id} not found`,
        errorCode: "NonexistentResource",
        statusCode: 404,
      });

    return new SyUser(result);
  }

  public static async fetchByToken(tokenString: string): Promise<SyUser> {
    const token = await SyToken.fetch(tokenString);
    return await SyUser.fetch(token.data.account);
  }

  public static async fetchByEmail(email: string): Promise<SyUser> {
    const result = await queryOne<DatabaseUser>({
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    });

    if (result === null)
      throw new DatabaseError({
        message: `Email does not exist`,
        errorCode: "NonexistentResource",
        statusCode: 404,
      });

    return new SyUser(result);
  }

  public static async fetchByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<SyUser> {
    const user = await SyUser.fetchByEmail(email);
    console.log(
      user.fullData.password,
      password,
      await bcrypt.compare(password, user.fullData.password),
    );
    if (!(await bcrypt.compare(password, user.fullData.password))) {
      throw new AuthenticationError({
        errorCode: "NotLoggedIn",
        message: "Not logged in",
        statusCode: 401,
      });
    }

    return user;
  }

  public static async usernameExists(username: string): Promise<boolean> {
    return !!(await queryOne<DatabaseUser>({
      text: "SELECT * FROM users WHERE username = $1",
      values: [username],
    }));
  }

  public static async create(
    email: string,
    password: string,
    username: string,
  ): Promise<SyUser> {
    if (await SyUser.emailExists(email))
      throw new DatabaseError({
        message: "Email already registered",
        errorCode: "EmailExists",
        statusCode: 400,
      });

    if (await SyUser.usernameExists(username))
      throw new DatabaseError({
        message: "Somebody already has this username!",
        errorCode: "Conflict",
        statusCode: 400,
      });

    const _password = await bcrypt.hash(password, 10);

    const user = (await queryOne<DatabaseUser>({
      text: "INSERT INTO users (username, password, email) VALUES ($1, $2, $3, $4) RETURNING *",
      values: [username, _password, email],
    })) as DatabaseUser;

    return new SyUser(user);
  }

  public async changePassword(to: string): Promise<void> {
    const _password = await bcrypt.hash(to, 10);
    await query({
      text: "UPDATE users SET password = $1 WHERE id = $2",
      values: [_password, this.data.id],
    });
  }

  toJSON() {
    return this.data;
  }
}
