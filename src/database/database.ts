import pg from "pg";
import ErrorType from "../errors/ErrorTypes";
import DatabaseError from "../errors/DatabaseError";
import Logger from "../util/Logger";

import users from "./users";

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
  users,
} as const;

export default database;

export async function multiUpadate<T extends pg.QueryResultRow>(
  tableName: string,
  id: number,
  data: object,
): Promise<T> {
  const setClause = Object.entries(data)
    .map((x, i) => `${x[0]} = $${i + 2}`)
    .join(", ");

  const queryText = `
        UPDATE ${tableName}
        SET ${setClause}
        WHERE id = $1
        RETURNING *;
      `;

  const values = [id, ...Object.values(data)];

  const result = await queryOne<T>({
    text: queryText,
    values: values,
  });

  return result as T;
}

export async function queryOne<T extends pg.QueryResultRow>(
  options: DatabaseQueryOptions,
): Promise<T | null> {
  if (!client) {
    console.error(`Database client was not initialised.`);
    process.exit(1);
  }

  const result = await client.query<T>({
    text: options.text,
    values: options.values,
  });

  return !result.rows[0] ? null : result.rows[0];
}

export async function query<T extends pg.QueryResultRow>(
  options: DatabaseQueryOptions,
): Promise<pg.QueryResult<T>> {
  if (!client) {
    console.error(`Database client was not initialised.`);
    process.exit(1);
  }
  try {
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
