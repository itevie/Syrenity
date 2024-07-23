import * as database from "../database";
import { stripUser } from "../util";

export default {
    fetchByEmail: async (email: string): Promise<FullUser> => {
        return (await database.query({
            text: `SELECT * FROM users WHERE email = $1`,
            values: [email],
            noRowsError: {
                message: `Failed to fetch user by email ${email}`,
                safeMessage: "Failed to fetch the user"
            }
        })).rows[0] as FullUser;
    },

    fetch: async (userId: number): Promise<User> => {
        return stripUser((await database.query({
            text: `SELECT * FROM users WHERE id = $1`,
            values: [userId],
            cache: {
                name: "UserByID",
                key: userId,
            },
            noRowsError: {
                message: `The user with ID ${userId} does not exist`
            }
        })).rows[0] as FullUser);
    },

    fetchFull: async (userId: number): Promise<User> => {
        return (await database.query({
            text: `SELECT * FROM users WHERE id = $1`,
            values: [userId],
            cache: {
                name: "UserByID",
                key: userId,
            },
            noRowsError: {
                message: `The user with ID ${userId} does not exist`
            }
        })).rows[0] as FullUser;
    },

    exists: async (userId: number): Promise<boolean> => {
        return (await database.query({
            text: `SELECT 1 FROM users WHERE id = $1`,
            values: [userId],
            cache: {
                name: "UserExists",
                key: userId,
            },
        })).rows.length !== 0;
    },

    fetchGuilds: async (userId: number): Promise<Guild[]> => {
        return (await database.query({
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
                    ) = 1
            `,
            values: [userId]
        })).rows as Guild[];
    },

    setAvatar: async (userId: number, newAvatar: string): Promise<void> => {
        await database.query({
            text: `UPDATE users SET avatar = $2 WHERE id = $1`,
            values: [userId, newAvatar],
            cache: {
                clear: {
                    names: ["UserByID"],
                    keys: [userId]
                }
            }
        });
    }
}