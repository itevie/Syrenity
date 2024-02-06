import * as database from '../database';
import * as errors from '../errors';
import { FetchMessagesOptions } from '../types/sqlQuery';
import { CacheKey } from '../util/CacheManager';

export default {
  fetch: async (channelId: number): Promise<Channel> => {
    const res = await database.query({
      text: database.queries.FETCH_CHANNEL,
      values: [channelId],
      cache: {
        key: CacheKey.CHANNEL,
        name: "" + channelId
      }
    });

    // Check if it succeeded
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch channel ${channelId}`,
        error: new Error()
      });

    return res.rows[0] as Channel;
  },

  exists: async (channelId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_CHANNEL,
      values: [channelId],
      cache: {
        key: CacheKey.CHANNEL,
        name: "" + channelId
      }
    });

    return res.rows[0] ? true : false;
  },

  create: async (guildId: number, name: string): Promise<Channel> => {
    const res = await database.query({
      text: database.queries.CREATE_CHANNEL,
      values: [guildId, name],
      cache: {
        clearKeys: [
          CacheKey.GUILD_CHANNELS
        ],
        name: guildId
      }
    });

    return res.rows[0] as Channel;
  },

  createDMChannel: async (): Promise<number> => {
    const res = await database.query({
      text: database.queries.CREATE_DM_CHANNEL,
      values: []
    });

    return res.rows[0].id;
  },

  messages: {
    fetch: async (
      channelId: number,
      options: FetchMessagesOptions
    ): Promise<Message[]> => {
      // Construct the query
      const query = {
        text: database.queries[
          options.startAt
            ? "FETCH_CHANNEL_MESSAGES"
            : "FETCH_CHANNEL_MESSAGES_NO_START"
        ],
        values: [channelId, options.amount]
      }

      // Check if should add start at option
      if (options.startAt) query.values.push(options.startAt);

      // Send query
      const res = await database.query(query);
      return res.rows as Message[];
    },

    create: async (details: { channelId: number, authorId: number, content: string }): Promise<Message> => {
      const res = await database.query({
        text: database.queries.CREATE_MESSAGE,
        values: [details.channelId, details.authorId, new Date(), details.content],
      });

      return res.rows[0] as Message;
    }
  },
}