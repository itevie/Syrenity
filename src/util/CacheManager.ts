import pg from 'pg';
import config from '../config.json';
import Logger from '../Logger';
import { SQLQuery } from '../types/sqlQuery';

const logger = new Logger("Cache");

export enum CacheKey {
  APPLICATION_BY_USER_ID,
  APPLICATION_BY_TOKEN,
  USER_ID_HAS_TOKEN,

  CHANNEL,

  MEMBER,

  GUILD_MEMBERS,
  GUILD_CHANNELS,
  GUILD_ROLES,
  GUILD,
  GUILD_HAS_MEMBER,

  MEMBER_ROLES,
  ROLE,
  ROLE_EXISTS,

  MESSAGE,

  MESSAGE_IS_PINNED,

  USER,
  USER_PARTIAL,
  USER_GUILDS,

  DISCRIMINATORS_FOR_USERNAME,

  INVITE,
}

interface Cache {
  [key: string]: {
    [key: string]: {
      createdAt: number;
      value: pg.QueryResult
    }
  }
}

/**
 * SQL query cache manager
 */
export default class CacheManager {
  /**
   * The stored cache
   */
  private cache: Cache = {};

  public checkCache(data: SQLQuery): pg.QueryResult | null {

    // Check if it allows cache
    if (!data.cache) return null;

    // Correct the type for data stuff
    if (data.cache.key)
      data.cache.key = "" + data.cache.key;
    if (data.cache.name)
      data.cache.name = "" + data.cache.name;

    // Check if this query clears parts of cache
    if (data.cache.clearKeys) {
      // Clear all keys
      for (const i in data.cache.clearKeys) {
        const currentKey = data.cache.clearKeys[i];

        // Check if it is in cache
        if (this.cache[currentKey]) {
          // Check if it contains what it is deleting
          if (this.cache[currentKey][data.cache.name]) {
            logger.log(`Delete cache key ${CacheKey[currentKey]} for name ${data.cache.name}`);

            // Delete it
            delete this.cache[currentKey][data.cache.name];
          }
        }
      }
    }

    // Check for specific delete
    if (data.cache.clearSpecific) {
      for (const specific of data.cache.clearSpecific) {
        // Check if the key eixsts
        if (specific.key && this.cache[specific.key]) {
          // Check if it contains what it is deleting
          if (this.cache[specific.key][specific.name]) {
            // Delete it
            logger.log(`Delete cache key ${CacheKey[specific.key]} for name ${specific.name} via clear specific`);
            delete this.cache[specific.key][specific.name];
          }
        }
      }
    }

    // Check if there is no key
    if (data.cache.key === undefined || !this.cache[data.cache.key]) return null;
    if (!this.cache[data.cache.key][data.cache.name]) return null;
    
    // Check if it wants to be deleted
    if (data.cache.clear ||
      config.server.cache.lifespan -
      (Date.now() - this.cache[data.cache.key][data.cache.name].createdAt) < 0
    ) {
      // Delete it
      logger.log(`Delete cache key ${CacheKey[data.cache.key]} for name ${data.cache.name} as it expired`);
      delete this.cache[data.cache.key][data.cache.name];
    } else {
      // The cache exists
      logger.log(`Used cache key ${CacheKey[data.cache.key]} for name ${data.cache.name}`);
      return this.cache[data.cache.key][data.cache.name].value;
    }

    return null;
  }

  public add(data: SQLQuery, queryResult: pg.QueryResult): void {
    // Check if it allows cache
    if (!data.cache) return;
    if (data.cache.clear || data.cache.clearKeys || !data.cache.key) return;

    // Set the cache
    if (!this.cache[data.cache.key]) this.cache[data.cache.key] = {};

    this.cache[data.cache.key][data.cache.name] = {
      createdAt: Date.now(),
      value: queryResult
    };

    logger.log(`Set key ${CacheKey[data.cache.key]} for name ${data.cache.name}`);
  }
}