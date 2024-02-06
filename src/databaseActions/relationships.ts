import { DatabaseError } from 'pg';
import * as database from '../database';
import * as errors from '../errors';
import { CacheKey } from '../util/CacheManager';

export default {
  fetchList: async (userId: number): Promise<Relationship[]> => {
    const res = await database.query({
      text: database.queries.FETCH_USER_RELATIONSHIPS,
      values: [userId]
    });

    return res.rows;
  },

  exists: async (user1: number, user2: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.RELATIONSHIP_EXISTS,
      values: [user1, user2]
    });

    return res.rows[0] ? true : false;
  },

  createRelationship: async (user1: number, user2: number): Promise<Relationship> => {
    // Create the channel
    const channel = await database.actions.channels.createDMChannel();
    const res = await database.query({
      text: database.queries.CREATE_RELATIONSHIP,
      values: [channel, user1, user2],
    });

    return res.rows[0] as Relationship;
  },

  isRelationship: async (channelId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_RELATIONSHIP_BY_CHANNEL_ID,
      values: [channelId]
    });

    return res.rows[0] ? true : false;
  },

  fetchByChannelId: async (channelId: number): Promise<Relationship> => {
    const res = await database.query({
      text: database.queries.FETCH_RELATIONSHIP_BY_CHANNEL_ID,
      values: [channelId]
    });

    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch the relationship by channel ID: ${channelId}`,
        error: new Error()
      });

    return res.rows[0];
  }
}