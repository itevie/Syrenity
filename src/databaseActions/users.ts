import * as database from '../database';
import * as errors from '../errors';
import { CacheKey } from '../util/CacheManager';

export default {
  fetch: async (userId: number): Promise<PartialUser> => {
    const res = await database.query({
      text: database.queries.FETCH_PARTIAL_USER,
      values: [userId],
      cache: {
        key: CacheKey.USER_PARTIAL,
        name: "" + userId
      }
    });

    // Check if it succeeded
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch user ${userId}`,
        error: new Error()
      });

    return res.rows[0] as PartialUser;
  },

  exists: async (userId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_PARTIAL_USER,
      values: [userId],
      cache: {
        key: CacheKey.USER_PARTIAL,
        name: "" + userId
      }
    });

    return res.rows[0] ? true : false;
  },

  fetchByEmail: async (email: string): Promise<User> => {
    const res = await database.query({
      text: database.queries.FETCH_BY_EMAIL,
      values: [email],
    });

    // Check if it succeeded
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch user ${email}`,
        safeMessage: `Failted to fetch the user`,
        error: new Error()
      });

    return res.rows[0] as User;
  },

  fetchFull: async (userId: number): Promise<User> => {
    const res = await database.query({
      text: database.queries.FETCH_USER,
      values: [userId],
      cache: {
        key: CacheKey.USER,
        name: "" + userId
      }
    });

    // Check if it succeeded
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch user ${userId}`,
        error: new Error()
      });

    return res.rows[0] as User;
  },

  fetchGuilds: async (userId: number): Promise<Guild[]> => {
    const res = await database.query({
      text: database.queries.FETCH_USER_GUILDS,
      values: [userId],
      cache: {
        key: CacheKey.USER_GUILDS,
        name: userId
      }
    });

    return res.rows as Guild[];
  },

  fetchDiscriminatorsForusername: async (username: string): Promise<string[]> => {
    const res = await database.query({
      text: database.queries.FETCH_DISCRIMINATORS,
      values: [username],
      cache: {
        key: CacheKey.DISCRIMINATORS_FOR_USERNAME,
        name: "" + username
      }
    });

    return res.rows as string[];
  },

  emailExists: async (email: string): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_BY_EMAIL,
      values: [email],
    });
    
    return res.rows[0] ? true : false;
  },

  createUser: async (username: string, password: string, email: string, discriminator: string): Promise<void> => {
    await database.query({
      text: database.queries.CREATE_USER,
      values: [username, password, email, discriminator],
      cache: {
        clear: true,
        clearKeys: [
          CacheKey.USER,
          CacheKey.USER_PARTIAL,
        ],
        name: "" + username
      }
    });
  },

  updateAvatar: async (userId: number, avatar: string): Promise<void> => {
    await database.query({
      text: database.queries.UPDATE_USER_AVATAR,
      values: [userId, avatar],
      cache: {
        clearKeys: [
          CacheKey.USER,
          CacheKey.USER_PARTIAL,
        ],
        name: userId,
      }
    });
  }
}