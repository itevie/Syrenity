import AuthenticationError from "../errors/AuthenticationError";
import SyrenityError from "../errors/BaseError";
import database, { Database } from "./database";
import * as bcrypt from "bcrypt";

/**
 * Strips a FullUser of its scary details
 * @param oldUser The object to strip
 * @returns A normal user object
 */
export function stripUser(oldUser: FullUser): User {
  return {
    id: oldUser.id,
    username: oldUser.username,
    discriminator: oldUser.discriminator,
    avatar: oldUser.avatar,
    created_at: oldUser.created_at,
    bio: oldUser.bio,
    is_bot: oldUser.is_bot,
  };
}

export class DatabaseUsers {
  public db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async get(id: number | string): Promise<User> {
    return stripUser(
      (
        await this.db.query<FullUser>({
          text: "SELECT * FROM users WHERE id = $1",
          values: [id],
          noRowsError: {
            message: `Failed to fetch user ${id}`,
            errorCode: "NonexistentResource",
          },
        })
      ).rows[0]
    );
  }

  public async getFull(id: number | string): Promise<FullUser> {
    return (
      await this.db.query<FullUser>({
        text: "SELECT * FROM users WHERE id = $1",
        values: [id],
        noRowsError: {
          message: `Failed to fetch user ${id}`,
          errorCode: "NonexistentResource",
        },
      })
    ).rows[0];
  }

  public async getByEmail(email: string): Promise<FullUser> {
    return (
      await this.db.query<FullUser>({
        text: "SELECT * FROM users WHERE email = $1",
        values: [email],
        noRowsError: {
          message: `Failed to fetch user by email`,
          errorCode: "NonexistentResource",
        },
      })
    ).rows[0];
  }

  public async validateEmailPassword(
    email: string,
    password: string
  ): Promise<FullUser> {
    const user = await this.getByEmail(email);
    if (!(await bcrypt.compare(password, user.password))) {
      throw new AuthenticationError({
        errorCode: "NotLoggedIn",
        message: "Not logged in",
        statusCode: 401,
      });
    }

    return user;
  }

  public async fetchByToken(tokenString: string): Promise<FullUser> {
    const token = await database.tokens.fetch(tokenString);
    return await this.getFull(token.account);
  }

  public async getServers(id: number | string): Promise<Server[]> {
    return (
      await this.db.query<Server>({
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
        values: [id],
      })
    ).rows;
  }
}
