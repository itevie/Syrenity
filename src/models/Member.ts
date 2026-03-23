import { queryOne, query } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import { getBitfieldForMember } from "../util/permissionChecker";
import { send } from "../ws/websocketUtil";
import SyCustomStatus, { DatabaseCustomStatus } from "./CustomStatus";
import { DatabaseInvite } from "./Invite";
import SyServer from "./Servers";
import SyUser, { DatabaseUser } from "./User";

export interface DatabaseMember {
  guild_id: number;
  user_id: number;
  nickname: string | null;
}

export type ExpandedDatabaseMember = DatabaseMember & {
  user: SyUser;
  status: SyCustomStatus;
  permissions: number;
};

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
    userId: number
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

  public static async expand(
    members: DatabaseMember[],
    server: SyServer
  ): Promise<ExpandedDatabaseMember[]> {
    const users = await query<DatabaseUser>({
      text: "SELECT * FROM users WHERE id = ANY($1)",
      values: [members.map((x) => x.user_id)],
    });

    const customStatuses = [
      ...(
        await SyCustomStatus.fetchMany(members.map((x) => x.user_id))
      ).values(),
    ];

    const bitfields: Map<number, number> = new Map();

    for await (const _user of users.rows) {
      const user = new SyUser(_user);
      const permissions = await getBitfieldForMember({ user, guild: server });
      bitfields.set(user.data.id, permissions);
    }

    return members.map((x) => ({
      ...new SyMember(x).data,
      user: new SyUser(
        users.rows.find((y) => y.id == x.user_id) as DatabaseUser
      ),
      status: customStatuses.find((y) => y.data.user_id === x.user_id)!,
      permissions: bitfields.get(x.user_id)!,
    }));
  }

  public static async fetchAllWithUser(
    server: SyServer
  ): Promise<ExpandedDatabaseMember[]> {
    const result = await query<DatabaseMember>({
      text: "SELECT * FROM members WHERE guild_id = $1",
      values: [server.data.id],
    });

    return SyMember.expand(result.rows, server);
  }

  public static async create(
    serverId: number,
    userId: number
  ): Promise<SyMember> {
    const member = new SyMember(
      (await queryOne<DatabaseMember>({
        text: "INSERT INTO members (guild_id, user_id) VALUES ($1, $2) RETURNING *;",
        values: [serverId, userId],
      })) as DatabaseMember
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
