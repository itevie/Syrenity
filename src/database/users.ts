import AuthenticationError from "../errors/AuthenticationError";
import { stripUser } from "../util/util";
import database, { query } from "./database";
import * as bcrypt from "bcrypt";

const _actions = {
  async get(id: number | string): Promise<User> {
    return stripUser(
      (
        await query<FullUser>({
          text: "SELECT * FROM users WHERE id = $1",
          values: [id],
          noRowsError: {
            message: `Failed to fetch user ${id}`,
            errorCode: "NonexistentResource",
          },
        })
      ).rows[0],
    );
  },

  async getFull(id: number | string): Promise<FullUser> {
    return (
      await query<FullUser>({
        text: "SELECT * FROM users WHERE id = $1",
        values: [id],
        noRowsError: {
          message: `Failed to fetch user ${id}`,
          errorCode: "NonexistentResource",
        },
      })
    ).rows[0];
  },

  async getByEmail(email: string): Promise<FullUser> {
    return (
      await query<FullUser>({
        text: "SELECT * FROM users WHERE email = $1",
        values: [email],
        noRowsError: {
          message: `Failed to fetch user by email`,
          errorCode: "NonexistentResource",
        },
      })
    ).rows[0];
  },

  async validateEmailPassword(
    email: string,
    password: string,
  ): Promise<FullUser> {
    const user = await _actions.getByEmail(email);

    console.log(user.password, password);
    if (!(await bcrypt.compare(password, user.password))) {
      throw new AuthenticationError({
        errorCode: "NotLoggedIn",
        message: "Not logged in",
        statusCode: 401,
      });
    }

    return user;
  },

  async getServers(id: number | string): Promise<Server[]> {
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
        values: [id],
      })
    ).rows;
  },
};

export default _actions;
