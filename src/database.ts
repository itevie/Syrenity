import pg from 'pg';
import fs from 'fs';
import getAllFiles from './util/getAllFiles';
import Logger from './Logger';
import CacheManager from './util/CacheManager';
import databaseActions from './databaseActions/init';
import { SQLQuery } from './types/sqlQuery';
import config from "./config.json";

const logger = new Logger("database");
const cacheManager = new CacheManager();

// Create client
const client = new pg.Client(config.database.constring);

// Load SQL files
const sql: SQLFiles = {};
const sqlFiles = getAllFiles(__dirname + "/sql");

for (const sqlFile of sqlFiles) {
  // Load name
  const name = sqlFile
    .split("/")
    [sqlFile.split("/").length - 1]
    .replace(/(\.sql)$/, "")
    .toUpperCase();
  
  // Load data
  const text = fs.readFileSync(sqlFile, "utf-8");
  sql[name] = text;
}

logger.log(`Loaded ${sqlFiles.length} SQL files!`);

/**
 * Initialises the database
 */
export async function initialise() {
  try {
    await client.connect();
    logger.log("Successfully connected to database!");
  } catch (err) {
    logger.error("Encountered error whilst connecting to database!");
    console.log(err);
    process.exit(1);
  }
  
  logger.log("Database connected successfully");
}

export async function close() {
  await client.end();
  logger.log("Database client disconnected");
}

/**
 * Queries the database, including cache
 * @param data The options and data for the query
 * @returns The result
 */
export async function query(data: SQLQuery): Promise<pg.QueryResult> {
  // Try fetch from cache
  const fromCache = cacheManager.checkCache(data);

  // Check if it was successfull
  if (fromCache != null)
    return fromCache;

  // Do query
  const finishedQuery = await makeQuery(data);

  // Check if it should be added to cache
  cacheManager.add(data, finishedQuery);

  // Return
  return finishedQuery;
}

/**
 * TODO: Create databaseError error class
 * @param data 
 */
async function makeQuery(data: SQLQuery): Promise<pg.QueryResult> {
  const result = await client.query({
    text: data.text,
    values: data.values
  });

  return result;
}

enum DatabaseCacheType {
  guildHasMember,
}

// Export
export {sql as queries};
export {databaseActions as actions};
export {DatabaseCacheType}; 
