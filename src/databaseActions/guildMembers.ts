import * as database from '../database';
import * as errors from '../errors';
import { CacheKey } from '../util/CacheManager';
import { computeBitField } from '../util/permissions';
import { combineIntoString } from '../util/simple';

export default {
  fetch: async (guildId: number, memberId: number): Promise<Member> => {
    const res = await database.query({
      text: database.queries.FETCH_GUILD_MEMBER,
      values: [guildId, memberId],
      cache: {
        key: CacheKey.MEMBER,
        name: combineIntoString(guildId, memberId)
      }
    });

    // Check if it succeededs
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch member ${memberId}`,
        error: new Error()
      });

    return res.rows[0] as Member;
  },

  fetchAll: async (guildId: number): Promise<Member[]> => {
    const res = await database.query({
      text: database.queries.FETCH_GUILD_MEMBERS,
      values: [guildId],
      cache: {
        key: CacheKey.GUILD_MEMBERS,
        name: guildId
      }
    });
    
    return res.rows as Member[];
  },

  has: async (guildId: number, memberId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.GUILD_HAS_MEMBER,
      values: [guildId, memberId],
      cache: {
        key: CacheKey.GUILD_HAS_MEMBER,
        name: combineIntoString(guildId, memberId)
      }
    });

    return res.rows[0] ? true : false;
  },

  add: async (guildId: number, memberId: number): Promise<void> => {
    await database.query({
      text: database.queries.ADD_GUILD_MEMBER,
      values: [guildId, memberId],
      cache: {
        clearKeys: [
          CacheKey.GUILD_HAS_MEMBER,
          CacheKey.MEMBER
        ],
        clearSpecific: [
          {
            key: CacheKey.USER_GUILDS,
            name: memberId,
          }
        ],
        name: combineIntoString(guildId, memberId)
      }
    });
  },

  remove: async (guildId: number, memberId: number): Promise<void> => {
    await database.query({
      text: database.queries.REMOVE_GUILD_MEMBER,
      values: [guildId, memberId],
      cache: {
        clearKeys: [
          CacheKey.GUILD_HAS_MEMBER,
          CacheKey.MEMBER
        ],
        clearSpecific: [
          {
            key: CacheKey.USER_GUILDS,
            name: memberId,
          }
        ],
        name: combineIntoString(guildId, memberId)
      }
    });
  },

  fetchRoles: async (userId: number, guildId: number): Promise<Role[]> => {
    const res = await database.query({
      text: database.queries.FETCH_MEMBER_ROLES,
      values: [userId, guildId],
      cache: {
        key: CacheKey.MEMBER_ROLES,
        name: userId,
      }
    });

    return res.rows as Role[];
  }
};