import { Database } from "./database";

export default class DatabaseTemplate {
  public db: Database;

  constructor(db: Database) {
    this.db = db;
  }
}
