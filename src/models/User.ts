import { DbReturn, query, queryOne } from "../database/database";
import bcrypt from "bcrypt";
import AuthenticationError from "../errors/AuthenticationError";
import SyRelationship, {
  DatabaseRelationship,
  ExpandedRelationship,
} from "./Relationship";
import DatabaseError from "../errors/DatabaseError";
import { randomRange } from "../util/util";

export interface DatabaseUser {
  id: number;
  username: string;
  password: string;
  email: string;
  email_verified: boolean;
  discriminator: number;
  avatar: string | null;
  created_at: Date;
  is_bot: boolean;
  bio: string;
  profile_banner: string | null;
}

export type StrippedDatabaseUser = Omit<DatabaseUser, "password" | "email">;

export interface EditUserOptions {
  avatar?: string;
  profile_banner?: string;
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

  public static async emailExists(email: string): Promise<boolean> {
    return (
      (await queryOne<DatabaseUser>({
        text: "SELECT * FROM users WHERE email = $1",
        values: [email],
      })) !== null
    );
  }

  public static async fetch(id: number): DbReturn<SyUser> {
    const result = await queryOne<DatabaseUser>({
      text: "SELECT * FROM users WHERE id = $1",
      values: [id],
    });

    if (result === null)
      return err(
        new DatabaseError({
          message: `User ${id} does not exist`,
          statusCode: 404,
          errorCode: "NonexistentResource",
        })
      );

    return ok(new SyUser(result));
  }

  public static async fetchByEmail(email: string): DbReturn<SyUser> {
    const result = await queryOne<DatabaseUser>({
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    });

    if (result === null)
      return err(
        new DatabaseError({
          message: `Email does not exist`,
          statusCode: 404,
          errorCode: "NonexistentResource",
        })
      );

    return ok(new SyUser(result));
  }

  public static async fetchByEmailAndPassword(
    email: string,
    password: string
  ): DbReturn<SyUser> {
    const { data: user, error } = await SyUser.fetchByEmail(email);

    if (error) return err(error);

    if (!(await bcrypt.compare(password, user.fullData.password))) {
      throw new AuthenticationError({
        errorCode: "InvalidEmailOrPassword",
        message: "Incorrect credentials",
        statusCode: 401,
      });
    }

    return ok(user);
  }

  public static async getDiscriminatorsFor(
    username: string
  ): Promise<string[]> {
    return (
      await query<{ discriminator: string }>({
        text: "SELECT discriminator FROM users WHERE username = $1",
        values: [username],
      })
    ).rows.map((x) => x.discriminator);
  }

  public static async create(
    email: string,
    password: string,
    username: string
  ): DbReturn<SyUser> {
    // Check if email already exists
    if (await SyUser.emailExists(email))
      return err(
        new DatabaseError({
          message: "Email already registered",
          errorCode: "EmailExists",
          statusCode: 400,
        })
      );

    // Check if there are too many discriminators for this username
    const discrims = await SyUser.getDiscriminatorsFor(username);
    if (discrims.length > 9996)
      return err(
        new DatabaseError({
          message: "Too many users have this username",
          errorCode: "TooManyUsers",
          statusCode: 400,
        })
      );

    // Generate discriminator
    let discriminator: string = "";
    do {
      const d = randomRange(0, 1000).toString().padStart(4, "0");
      if (!discrims.includes(d)) discriminator = d;
    } while (discriminator === "");

    // Hash and create
    const _password = await bcrypt.hash(password, 10);
    const user = (await queryOne<DatabaseUser>({
      text: "INSERT INTO users (username, discriminator, password, email) VALUES ($1, $2, $3, $4) RETURNING *",
      values: [username, discriminator, _password, email],
    })) as DatabaseUser;

    return ok(new SyUser(user));
  }
}
