import { multiUpadate, queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import { query } from "../util/database";
import { send } from "../ws/websocketUtil";
import SyChannel from "./Channel";
import SyMember from "./Member";

export interface DatabaseServer {
  id: number;
  name: string;
  owner_id: number;
  description: string;
  avatar: string;
}

export interface CreateServerOptions {
  name: string;
}

export interface EditServerOptions {
  name?: string;
  avatar?: string;
}

export default class SyServer {
  constructor(public data: DatabaseServer) {}

  public async organiseChannels() {
    const channels = await this.fetchChannels();
    const validChannels = channels.filter(
      (channel) => channel.data.position >= 0
    );
    const unpositionedChannels = channels.filter(
      (channel) => channel.data.position === -1
    );

    validChannels.sort((a, b) => a.data.position - b.data.position);

    let newPosition = 1;
    for (const channel of validChannels) {
      if (channel.data.position !== newPosition) {
        await queryOne({
          text: "UPDATE channels SET position = $1 WHERE id = $2",
          values: [newPosition, channel.data.id],
        });
      }
      newPosition++;
    }

    for (const channel of unpositionedChannels) {
      await queryOne({
        text: "UPDATE channels SET position = $1 WHERE id = $2",
        values: [newPosition, channel.data.id],
      });
      newPosition++;
    }
  }

  public async fetchChannels() {
    return (
      await query({
        text: "SELECT * FROM channels WHERE guild_id = $1",
        values: [this.data.id],
      })
    ).rows.map((x) => new SyChannel(x));
  }

  public async edit(options: EditServerOptions): Promise<SyServer> {
    const data = await multiUpadate<DatabaseServer>(
      "guilds",
      this.data.id,
      options
    );
    this.data = data;

    send({
      type: "ServerUpdate",
      guild: this.data.id,
      payload: {
        server: this.data,
      },
    });

    return this;
  }

  public static async create(
    ownerId: number,
    options: CreateServerOptions
  ): Promise<SyServer> {
    const server = new SyServer(
      (await queryOne<DatabaseServer>({
        text: "INSERT INTO guilds (owner_id, name) VALUES ($1, $2) RETURNING *",
        values: [ownerId, options.name],
      })) as DatabaseServer
    );

    await SyChannel.createServerChannel(server.data.id, {
      name: "general",
    });

    await SyMember.create(server.data.id, ownerId);

    return server;
  }

  public static async fetch(id: number): Promise<SyServer> {
    const result = await queryOne<DatabaseServer>({
      text: "SELECT * FROM guilds WHERE id = $1;",
      values: [id],
    });

    if (result === null)
      throw new DatabaseError({
        message: `Server ${id} does not exist`,
        statusCode: 404,
        errorCode: "NonexistentResource",
      });

    return new SyServer(result);
  }
}
