import * as database from '../database';
import * as errors from '../errors';
import { FetchMessagesOptions } from '../types/sqlQuery';
import { CacheKey } from '../util/CacheManager';

export default {
  fetchAll: async (channelId: number): Promise<Message[]> => {
    const res = await database.query({
      text: database.queries.FETCH_CHANNEL_PINS,
      values: [channelId],
    });

    return res.rows;
  },


  isPinned: async (messageId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.MESSAGE_IS_PINNED,
      values: [messageId],
      cache: {
        key: CacheKey.MESSAGE_IS_PINNED,
        name: messageId
      }
    });

    return res.rows[0] ? true : false;
  },

  pin: async (messageId: number): Promise<void> => {
    await database.query({
      text: database.queries.PIN_MESSAGE,
      values: [messageId],
      cache: {
        clearKeys: [
          CacheKey.MESSAGE_IS_PINNED,
          CacheKey.MESSAGE
        ],
        name: messageId,
      }
    });
  },

  unpin: async (messageId: number): Promise<void> => {
    await database.query({
      text: database.queries.UNPIN_MESSAGE,
      values: [messageId],
      cache: {
        clearKeys: [
          CacheKey.MESSAGE_IS_PINNED,
          CacheKey.MESSAGE
        ],
        name: messageId,
      }
    });
  }
}