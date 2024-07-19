import pg from "pg";
import { DatabaseQuery, DatabaseQueryCachOptionsAdd } from "./database";
import Logger from "./Logger";

interface CacheStorage {
    // The names
    [key: string]: {
        // The keys
        [key: string]: {
            createdAt: number,
            life: number,
            result: pg.QueryResult
        }
    }
}

const logger = new Logger("cache");

export default class CacheManager {
    private cache: CacheStorage = {};

    public check(query: DatabaseQuery): pg.QueryResult | null {
        if (!query.cache) return null;

        // Check if this query deletes cache
        if ("clear" in query.cache && query.cache.clear) {
            const names = query.cache.clear.names;
            const keys = query.cache.clear.keys;

            // Loop through the names to kill
            for (const name of names) {
                const objInCache = this.cache[name];

                // Check if it existed
                if (objInCache) {
                    // Loop through the keys to kill in this name
                    for (let key of keys) {
                        if (Array.isArray(key)) key = key.join("---");
                        const obj = objInCache[key];
                        // Check if it existed
                        if (obj) {
                            logger.log(`${name}: ${key} deleted from cache`);
                            delete this.cache[name][key];
                        }
                    }
                }
            }

            return null;
        }

        const name = (query.cache as DatabaseQueryCachOptionsAdd).name;
        let key = (query.cache as DatabaseQueryCachOptionsAdd).key.toString();
        if (Array.isArray(key)) key = key.join("---");
        const life = (query.cache as DatabaseQueryCachOptionsAdd).life || 30000;

        // Get the key
        const value = this.cache[name]?.[key];
        if (!value) return null;

        // Check if it has expired
        if (life - (Date.now() - value.createdAt) < 0) {
            logger.log(`${name}: ${key} expired`);
            delete this.cache[name][key];
            
            return null;
        }

        // ok bud
        logger.log(`${name}: ${key} fetched from cache`)
        return value.result;
    }

    public add(options: DatabaseQuery, result: pg.QueryResult): void {
        // Guards
        if (!options.cache) return;
        if (!("key" in options.cache)) return;
        const key = Array.isArray(options.cache.key)
            ? options.cache.key.join("---")
            : options.cache.key;

        // Check if name exists
        if (!this.cache[options.cache.name])
            this.cache[options.cache.name] = {};

        // Set it
        this.cache[options.cache.name][key] = {
            life: options.cache.life || 1000 * 120,
            createdAt: Date.now(),
            result,
        };

        logger.log(`${options.cache.name}: ${key} added`);
    }
}