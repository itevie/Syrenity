import pg from "pg";
import Logger from "../util/Logger";
import ErrorType from "../errors/ErrorTypes";
import DatabaseError from "../errors/DatabaseError";
import { DatabaseUsers } from "./users";
import { DatabaseTokens } from "./tokens";
import DatabaseServers from "./servers";

export interface DatabaseQueryOptions {
  text: string;
  values: any[];
  noRowsError?: {
    message: string;
    safeMessage?: string;
    errorCode?: ErrorType;
  };
}

export class Database {
  public client: pg.Client;
  public logger = new Logger("database");

  public users = new DatabaseUsers(this);
  public tokens = new DatabaseTokens(this);
  public servers = new DatabaseServers(this);

  public async initialise(constring: string): Promise<void> {
    try {
      this.client = new pg.Client(constring);
      await this.client.connect();
    } catch (err) {
      this.logger.error(`Failed to connect to DB!`);
      console.error(err);
      process.exit(1);
    }
  }

  public async query<T extends pg.QueryResultRow>(
    options: DatabaseQueryOptions
  ): Promise<pg.QueryResult<T>> {
    const result = await this.client.query<T>({
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
  }
}

const database = new Database();
export default database;
