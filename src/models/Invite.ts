import { queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import { randomID } from "../util/util";
import SyChannel, { DatabaseChannel } from "./Channel";
import SyMember from "./Member";
import SyServer, { DatabaseServer } from "./Servers";

export interface DatabaseInvite {
  id: string;
  guild_id: number;
  channel_id: number | null;
  created_by: number;
  created_at: Date;
  expires_in: number | null;
  max_uses: number | null;
  uses: number;
}

export type ExpandedInvite = DatabaseInvite & {
  channel: DatabaseChannel | null;
  guild: DatabaseServer | null;
};

export interface CreateInviteOptions {
  id?: string;
  channel_id?: number;
  expires_in?: number;
  max_uses?: number;
}

export default class SyInvite {
  constructor(public data: DatabaseInvite) {}

  public async expand(): Promise<ExpandedInvite> {
    return {
      ...this.data,
      channel: this.data.channel_id
        ? (await SyChannel.fetch(this.data.channel_id)).data
        : null,
      guild: this.data.guild_id
        ? (await SyServer.fetch(this.data.guild_id)).data
        : null,
    };
  }

  public async use(userId: number): Promise<SyMember> {
    const member = await SyMember.create(this.data.guild_id, userId);
    await this.increaseUsage();
    return member;
  }

  public async increaseUsage(): Promise<void> {
    this.data = (await queryOne<DatabaseInvite>({
      text: "UPDATE invites SET uses = uses + 1 WHERE id = $1",
      values: [this.data.id],
    })) as DatabaseInvite;
  }

  public static async fetch(id: string): Promise<SyInvite> {
    const result = await queryOne<DatabaseInvite>({
      text: "SELECT * FROM invites WHERE id = $1",
      values: [id],
    });

    if (result === null)
      throw new DatabaseError({
        message: `Invite with ID ${id} does not exist`,
        errorCode: "NonexistentResource",
        statusCode: 404,
      });

    return new SyInvite(result);
  }

  public static async create(
    guildId: number,
    createdBy: number,
    options: CreateInviteOptions,
  ): Promise<SyInvite> {
    return new SyInvite(
      (await queryOne<DatabaseInvite>({
        text: "INSERT INTO invites(id, guild_id, created_by, channel_id, expires_in, max_uses) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        values: [
          options.id ?? randomID(6),
          guildId,
          createdBy,
          options.channel_id,
          options.expires_in,
          options.max_uses,
        ],
      })) as DatabaseInvite,
    );
  }

  toJSON() {
    return this.data;
  }
}
