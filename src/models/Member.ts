import { queryOne, query } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import { send } from "../ws/websocketUtil";
import { DatabaseInvite } from "./Invite";

export interface DatabaseMember {
  guild_id: number;
  user_id: number;
  nickname: string | null;
}

export default class SyMember {
  constructor(public data: DatabaseMember) {}

  public async remove(): Promise<void> {
    await queryOne({
      text: "DELETE FROM members WHERE guild_id = $1 AND user_id = $2",
      values: [this.data.guild_id, this.data.user_id],
    });

    send({
      type: "ServerMemberRemove",
      guild: this.data.guild_id,
      recipients: [this.data.user_id],
      payload: {
        member: this.data,
      },
    });
  }

  public static async has(serverId: number, userId: number): Promise<boolean> {
    return (
      (await queryOne<DatabaseInvite>({
        text: "SELECT * FROM members WHERE guild_id = $1 AND user_id = $2",
        values: [serverId, userId],
        ignoreErrors: true,
      })) !== null
    );
  }

  public static async fetch(
    serverId: number,
    userId: number,
  ): Promise<SyMember> {
    const result = await queryOne<DatabaseMember>({
      text: "SELECT * FROM members WHERE guild_id = $1 AND user_id = $2",
      values: [serverId, userId],
    });

    if (result === null)
      throw new DatabaseError({
        message: `User ${userId} is not in server ${serverId}`,
        errorCode: "UserNotInServer",
        statusCode: 404,
      });

    return new SyMember(result);
  }

  public static async fetchAll(serverId: number): Promise<SyMember[]> {
    const result = await query<DatabaseMember>({
      text: "SELECT * FROM members WHERE guild_id = $1",
      values: [serverId],
    });

    return result.rows.map((x) => new SyMember(x));
  }

  public static async create(
    serverId: number,
    userId: number,
  ): Promise<SyMember> {
    const member = new SyMember(
      (await queryOne<DatabaseMember>({
        text: "INSERT INTO members (guild_id, user_id) VALUES ($1, $2) RETURNING *;",
        values: [serverId, userId],
      })) as DatabaseMember,
    );

    send({
      type: "ServerMemberAdd",
      guild: serverId,
      payload: {
        member: member.data,
      },
    });

    return member;
  }

  toJSON() {
    return this.data;
  }
}
