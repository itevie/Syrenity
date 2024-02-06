import { DatabaseError } from 'pg';
import * as database from '../database';
import * as errors from '../errors';
import { CacheKey } from '../util/CacheManager';

export default {
  add: async (forUser: number, byUser: number): Promise<void> => {
    await database.query({
      text: database.queries.ADD_FRIEND_REQUEST,
      values: [forUser, byUser]
    });
  },

  remove: async (forUser: number, byUser: number): Promise<void> => {
    await database.query({
      text: database.queries.DELETE_FRIEND_REQUEST,
      values: [forUser, byUser]
    });
  },

  exists: async (forUser: number, byUser: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_FRIEND_REQUEST,
      values: [forUser, byUser]
    });

    return res.rows[0] ? true : false;
  },

  fetchAll: async (forUser: number): Promise<FriendRequest> => {
    const res = await database.query({
      text: database.queries.FETCH_FRIEND_REQUESTs,
      values: [forUser]
    });

    return res.rows[0];
  }
}