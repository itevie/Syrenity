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
}

export type DbReturn<T> = Promise<Result<T, DatabaseError>>;

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

export async function multiUpadate<T extends pg.QueryResultRow>(
  tableName: string,
  id: number,
  data: object
): Promise<T | null> {
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

  return result;
}

export async function queryOne<T extends pg.QueryResultRow>(
  query: pg.QueryConfig
): Promise<T | null> {
  if (!client) {
    console.error(`Database client was not initialised.`);
    process.exit(1);
  }

  try {
    const result = await client.query<T>(query);

    return result.rows.length === 0 ? null : result.rows[0];
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

export async function query<T extends pg.QueryResultRow>(
  query: pg.QueryConfig
): Promise<pg.QueryResult<T>> {
  if (!client) {
    console.error(`Database client was not initialised.`);
    process.exit(1);
  }
  try {
    const result = await client.query<T>(query);

    return result;
  } catch (e) {
    console.log(query);
    process.exit(1);
  }
}
