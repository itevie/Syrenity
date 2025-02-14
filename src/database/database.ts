import pg from "pg";
import ErrorType from "../errors/ErrorTypes";
import DatabaseError from "../errors/DatabaseError";
import Logger from "../util/Logger";

import users from "./users";
import tokens from "./tokens";
import servers from "./servers";
import files from "./files";
import messages from "./messages";

export interface DatabaseQueryOptions {
  text: string;
  values: any[];
  ignoreErrors?: boolean;
  noRowsError?: {
    message: string;
    safeMessage?: string;
    errorCode?: ErrorType;
  };
}

const logger = new Logger("database");

export let client: pg.Client;

export async function initialise(constring: string): Promise<void> {
  try {
    client = new pg.Client(constring);
    await client.connect();
  } catch (err) {
    logger.error(`Failed to connect to DB!`);
    console.error(err);
    process.exit(1);
  }
}

const database = {
  servers,
  tokens,
  users,
  files,
  messages,
} as const;

export default database;

export async function queryOne<T extends pg.QueryResultRow>(
  options: DatabaseQueryOptions
): Promise<T> {
  if (!client) {
    console.error(`Database client was not initialised.`);
    process.exit(1);
  }

  const result = await client.query<T>({
    text: options.text,
    values: options.values,
  });

  if (result.rowCount === 0) {
    if (options.noRowsError === undefined && options.ignoreErrors) {
      return null as unknown as T;
    } else if (options.noRowsError === undefined && !options.ignoreErrors) {
      console.error(`No rows error not handled`, options);
      process.exit(1);
    } else if (options.noRowsError !== undefined) {
      throw new DatabaseError({
        message: options.noRowsError.message,
        safeMessage:
          options.noRowsError.safeMessage ?? options.noRowsError.message,
        statusCode: 404,
        errorCode: options.noRowsError.errorCode ?? "UnknownDatabaseError",
      });
    }
  }

  return result.rows[0];
}

export async function query<T extends pg.QueryResultRow>(
  options: DatabaseQueryOptions
): Promise<pg.QueryResult<T>> {
  try {
    if (!client) throw new Error("Database client was not initialised.");

    const result = await client.query<T>({
      text: options.text,
      values: options.values,
    });

    if (options.noRowsError && result.rowCount === 0) {
      throw new DatabaseError({
        message: options.noRowsError.message,
        safeMessage:
          options.noRowsError.safeMessage ?? options.noRowsError.message,
        statusCode: 404,
        errorCode: options.noRowsError.errorCode ?? "UnknownDatabaseError",
      });
    }

    return result;
  } catch (e) {
    console.log(options);
    throw e;
  }
}
