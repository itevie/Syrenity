import * as database from '../database';
import * as errors from '../errors';
import { CacheKey } from '../util/CacheManager';

import messagePins from './messagePins';

export default {
  fetch: async (messageId: number): Promise<Message> => {
    const res = await database.query({
      text: database.queries.FETCH_MESSAGE,
      values: [messageId],
      cache: {
        key: CacheKey.MESSAGE,
        name: "" + messageId
      }
    });

    // Check if it succeeded
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch message ${messageId}`,
        error: new Error()
      });

    return res.rows[0] as Message;
  },

  exists: async (messageId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_MESSAGE,
      values: [messageId],
      cache: {
        key: CacheKey.MESSAGE,
        name: "" + messageId
      }
    });

    return res.rows[0] ? true : false;
  },

  delete: async (messageId: number): Promise<void> => {
    await database.query({
      text: database.queries.DELETE_MESSAGE,
      values: [messageId],
      cache: {
        clearKeys: [CacheKey.MESSAGE],
        name: messageId
      }
    });
  },

  setContent: async (messageId: number, newContent: string): Promise<Message> => {
    const res = await database.query({
      text: database.queries.UPDATE_MESSAGE_CONTENT,
      values: [messageId, newContent],
      cache: {
        clearKeys: [CacheKey.MESSAGE],
        name: messageId,
      }
    });

    return res.rows[0];
  },

  pins: messagePins,
}