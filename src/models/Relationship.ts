import database, { queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import SyChannel, { DatabaseChannel } from "./Channel";
import SyUser, { DatabaseUser, StrippedDatabaseUser } from "./User";

export interface DatabaseRelationship {
  channel_id: number;
  user1: number;
  user2: number;
  last_message: Date;
  active: boolean;
  created_at: Date;
}

export type ExpandedRelationship = Omit<
  DatabaseRelationship,
  "user1" | "user2"
> & {
  user1: StrippedDatabaseUser;
  user2: StrippedDatabaseUser;
  channel: DatabaseChannel;
};

export default class SyRelationship {
  constructor(public data: DatabaseRelationship) {}

  public async expand(): Promise<ExpandedRelationship> {
    return {
      ...this.data,
      user1: (await SyUser.fetch(this.data.user1)).data,
      user2: (await SyUser.fetch(this.data.user2)).data,
      channel: (await SyChannel.fetch(this.data.channel_id)).data,
    };
  }

  public static async fetchByChannel(channel: number): Promise<SyRelationship> {
    const result = await queryOne<DatabaseRelationship>({
      text: "SELECT * FROM relationships WHERE channel_id = $1",
      values: [channel],
    });

    if (result === null)
      throw new DatabaseError({
        message: `Failed to fetch relationship by channel ${channel}`,
        errorCode: "NonexistentResource",
        statusCode: 404,
      });

    return new SyRelationship(result);
  }

  public static async existsBetween(
    user1: number,
    user2: number,
  ): Promise<boolean> {
    return (
      (await queryOne<DatabaseUser>({
        text: "SELECT * FROM relationships WHERE user1 = $1 OR user2 = $2",
        values: [user1, user2],
        ignoreErrors: true,
      })) !== null
    );
  }

  public static async fetch(
    user1: number,
    user2: number,
  ): Promise<SyRelationship> {
    const result = await queryOne<DatabaseRelationship>({
      text: "SELECT * FROM relationships WHERE user1 = $1 OR user2 = $2",
      values: [user1, user2],
    });

    if (result === null)
      throw new DatabaseError({
        message: "Failed to fetch relationship",
        statusCode: 404,
        errorCode: "NonexistentResource",
      });

    return new SyRelationship(result);
  }

  toJSON() {
    return this.data;
  }
}
