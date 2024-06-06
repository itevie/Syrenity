import pg from "pg";
import config from "../config.json";
import Logger from "./Logger";
import actions from "./dbactions/init";
import DatabaseError from "../errors/DatabaseError";

// Create client
const client = new pg.Client(config.database.constring);
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

/**
 * Create a query to the database
 * @param data The database query options
 * @returns The query result
 */
export async function query(data: DatabaseQuery): Promise<pg.QueryResult> {
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
        });
    }

    return result;
}

interface DatabaseQuery {
    text: string;
    values: any[];
    noRowsError?: {
        message: string;
        safeMessage?: string;
    };
}

interface DatabaseQueryCachOptions {
    
}

export {actions};
