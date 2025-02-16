import { queryOne } from "../database/database";
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

  public static async create(
    serverId: number,
    userId: number
  ): Promise<SyMember> {
    const member = new SyMember(
      await queryOne<DatabaseMember>({
        text: "INSERT INTO members (guild_id, user_id) VALUES ($1, $2) RETURNING *;",
        values: [serverId, userId],
      })
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
}
