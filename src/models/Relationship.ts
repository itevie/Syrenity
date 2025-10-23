import database, { queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import SyChannel, { DatabaseChannel } from "./Channel";
import SyUser, { DatabaseUser, StrippedDatabaseUser } from "./User";

export interface DatabaseRelationship {
  channel_id: number;
  user1: number;
  user2: number;
  last_message: Date;
  active_user_1: boolean;
  active_user_2: boolean;
  is_friends: boolean;
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

  public async setFriends(friends: boolean): Promise<SyRelationship> {
    let result = await queryOne<DatabaseRelationship>({
      text: "UPDATE relationships SET is_friends = $1 WHERE (user1 = $2 AND user2 = $3) OR (user1 = $3 AND user2 = $2) RETURNING *",
      values: [friends, this.data.user1, this.data.user2],
    });

    return new SyRelationship(result!);
  }

  public static async create(
    user1: number,
    user2: number,
  ): Promise<SyRelationship> {
    if (await SyRelationship.existsBetween(user1, user2))
      throw new DatabaseError({
        errorCode: "Conflict",
        message: "The relationship already exists",
        statusCode: 500,
      });

    const channel = await SyChannel.createDMChannel();

    const result = await queryOne<DatabaseRelationship>({
      text: "INSERT INTO relationships (channel_id, user1, user2, active_user_1, active_user_2, is_friends, last_message, created_at) VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
      values: [channel.data.id, user1, user2, true, false],
    });

    if (!result)
      throw new DatabaseError({
        errorCode: "UnknownServerError",
        message: "Failed to create relationship",
        statusCode: 500,
      });

    return new SyRelationship(result);
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
        text: "SELECT * FROM relationships WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)",
        values: [user1, user2],
        ignoreErrors: true,
      })) !== null
    );
  }

  public static async fetch(
    user1: number,
    user2: number,
  ): Promise<SyRelationship> {
    let result = await queryOne<DatabaseRelationship>({
      text: "SELECT * FROM relationships WHERE user1 = $1 OR user2 = $2",
      values: [user1, user2],
    });

    if (!result) result = (await SyRelationship.create(user1, user2)).data;

    return new SyRelationship(result);
  }

  toJSON() {
    return this.data;
  }
}
