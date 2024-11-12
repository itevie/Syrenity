import { Database } from "./database";

export default class DatabaseServer {
  public db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async get(id: number | string): Promise<Server> {
    return (
      await this.db.query<Server>({
        text: "SELECT * FROM guilds WHERE id = $1;",
        values: [id],
        noRowsError: {
          message: `Failed to fetch server ${id}`,
          errorCode: "NonexistentResource",
        },
      })
    ).rows[0];
  }

  public async getChannels(id: number | string): Promise<Channel[]> {
    return (
      await this.db.query<Channel>({
        text: "SELECT * FROM channels WHERE id = $1;",
        values: [id],
      })
    ).rows;
  }
}
