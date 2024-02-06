import { DatabaseError } from 'pg';
import * as database from '../database';
import * as errors from '../errors';
import { CacheKey } from '../util/CacheManager';

export default {
  exists: async (inviteCode: string): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_INVITE,
      values: [inviteCode],
      cache: {
        key: CacheKey.INVITE,
        name: inviteCode
      }
    });

    return res.rows[0] ? true : false;
  },

  fetch: async (inviteCode: string): Promise<Invite> => {
    const res = await database.query({
      text: database.queries.FETCH_INVITE,
      values: [inviteCode],
      cache: {
        key: CacheKey.INVITE,
        name: inviteCode
      }
    });

    // Check if it existed
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch the invite ${inviteCode}`,
        statusCode: 404,
        error: new Error()
      });

    return res.rows[0];
  },

  create: async (guildId: number, author: number): Promise<Invite> => {
    const res = await database.query({
      text: database.queries.CREATE_INVITE,
      values: [guildId, author],
      cache: {
        clearKeys: [ CacheKey.INVITE ],
        name: guildId
      }
    });

    return res.rows[0];
  }
}