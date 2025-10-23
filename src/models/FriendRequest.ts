import { query, queryOne } from "../database/database";
import SyRelationship from "./Relationship";

export interface DatabaseFriendRequest {
  for_user: number;
  by_user: number;
  created_at: Date;
}

export type ExpandedFriendRequest = DatabaseFriendRequest & {
  for_user: User;
  by_user: User;
};

export default class FriendRequest {
  constructor(public data: DatabaseFriendRequest) {}

  public static async fetchAllFor(userId: number): Promise<FriendRequest[]> {
    const fqs = await query<DatabaseFriendRequest>({
      text: "SELECT * FROM friend_requests WHERE by_user = $1 OR for_user = $1",
      values: [userId],
    });
    return fqs.rows.map((x) => new FriendRequest(x));
  }

  public async accept() {
    let relationship = await SyRelationship.fetch(
      this.data.by_user,
      this.data.for_user,
    );
    await relationship.setFriends(true);
    await this.delete();
  }

  public async delete() {
    await queryOne({
      text: "DELETE FROM friend_requests WHERE (for_user = $1 AND by_user = $2) OR (for_user = $2 AND by_user = $1)",
      values: [this.data.by_user, this.data.for_user],
    });
  }

  public static async fetch(
    user1: number,
    user2: number,
  ): Promise<FriendRequest> {
    const friendRequest = await queryOne<DatabaseFriendRequest>({
      text: "SELECT * FROM friend_requests WHERE (for_user = $1 AND by_user = $2) OR (for_user = $2 AND by_user = $1)",
      values: [user1, user2],
    });

    // TODO: Do this
    if (!friendRequest) throw new Error();

    return new FriendRequest(friendRequest);
  }

  public static async create(
    sender: number,
    sendee: number,
  ): Promise<FriendRequest> {
    let exists = await FriendRequest.fetch(sender, sendee);

    // TODO: Do this
    if (exists) throw new Error();

    let friendRequest = await queryOne<DatabaseFriendRequest>({
      text: "INSERT INTO friend_requests (for_user, by_user, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
      values: [sendee, sender],
    });

    return new FriendRequest(friendRequest!);
  }

  toJSON() {
    return this.data;
  }
}
