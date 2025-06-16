import { query } from "../database/database";

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

  toJSON() {
    return this.data;
  }
}
