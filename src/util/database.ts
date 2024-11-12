import pg from "pg";
import config from "../config.json";
import Logger from "./Logger";
import actions from "./dbactions/init";
import DatabaseError from "../errors/DatabaseError";
import ErrorType from "../errors/ErrorTypes";
import CacheManager from "./CacheManager";

// Create client
export const client = new pg.Client(config.database.constring);
const logger = new Logger("database");

/**
 * Initialise the databsae
 */
export async function initialise(): Promise<void> {
    try {
        await client.connect();
        logger.log("Database connected successfully");
    } catch (err) {
        logger.log("Encountered an error whilst trying to connect to the database, error is as follows");
        console.error(err);
        process.exit(1);
    }
}

/**
 * Close the database
 */
export async function close(): Promise<void> {
    await client.end();
    logger.log("Database client disconnected");
}

const cache = new CacheManager();

/**
 * Create a query to the database
 * @param data The database query options
 * @returns The query result
 */
export async function query(data: DatabaseQuery): Promise<pg.QueryResult> {
    const cacheResult = cache.check(data);

    if (cacheResult !== null) return cacheResult;

    // Create the query
    const result = await client.query({
        text: data.text,
        values: data.values
    });

    // Check for errors
    if (data.noRowsError && result.rowCount === 0) {
        throw new DatabaseError({
            message: data.noRowsError.message,
            safeMessage: data.noRowsError.safeMessage ?? data.noRowsError.message,
            statusCode: 404,
            errorCode: data.noRowsError.errorCode ?? "UnknownDatabaseError"
        });
    }

    // Add to cache
    cache.add(data, result);

    return result;
}

export async function quickQuery(query: string): Promise<pg.QueryResult> {
    return await client.query({
        text: query,
        values: []
    });
}

export interface DatabaseQuery {
    text: string;
    values: any[];
    cache?: DatabaseQueryCacheOptions,
    noRowsError?: {
        message: string;
        safeMessage?: string;
        errorCode?: ErrorType,
    };
}

export type CacheKey =
    // ----- Channels -----
    | "ChannelByID"
    | "ChannelExists"

    // ----- Guilds -----
    | "GuildByID"
    | "GuildExists"
    | "GuildHasMember"

    // ----- Messages -----
    | "MessageByID"
    | "MessageExists"

    // ----- Users -----
    | "UserByID"
    | "UserExists"

    // ----- Roles -----
    | "RoleByID"

export interface DatabaseQueryCachOptionsAdd {
    /**
     * The name of the item in the cache
     */
    name: CacheKey,

    /**
     * The key the item is under in the cache
     * 
     * i.e. user 32 in name USER_BY_ID 
     */
    key: any,

    /**
     * How long this item will survive in cache
     */
    life?: number,
}

export interface DatabaseQueryCachOptionsDelete {
    /**
     * Whether or not calling this query will clear cache
     */
    clear?: {
        names: CacheKey[],
        keys: any[],
    }
}

export type DatabaseQueryCacheOptions = DatabaseQueryCachOptionsAdd | DatabaseQueryCachOptionsDelete;

export { actions };
