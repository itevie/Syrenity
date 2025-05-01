import { query, queryOne } from "../database/database";
import { send } from "../ws/websocketUtil";

export type ChannelType = "dm" | "channel" | "category";

export interface DatabaseChannel {
  id: number;
  type: ChannelType;
  guild_id: number;
  name: string;
  topic: string;
  position: number;
}

export interface CreateChannelOptions {
  name: string;
}

export interface UpdateChannelOptions {
  name?: string;
  topic?: string;
  position?: number;
}

export default class SyChannel {
  constructor(public data: DatabaseChannel) {}

  public async setPosition(position: number): Promise<SyChannel> {
    if (this.data.type !== "category" && this.data.type !== "channel")
      throw new Error("Cannot change position of a non-server channel");

    if (this.data.position === position) return this;

    if (position < this.data.position) {
      await queryOne({
        text: "UPDATE channels SET position = position + 1 WHERE guild_id = $1 AND position >= $2 AND position < $3",
        values: [this.data.guild_id, position, this.data.position],
      });
    } else {
      await queryOne({
        text: "UPDATE channels SET position = position - 1 WHERE guild_id = $1 AND position <= $2 AND position > $3",
        values: [this.data.guild_id, position, this.data.position],
      });
    }

    const newChannel = (await queryOne<DatabaseChannel>({
      text: "UPDATE channels SET position = $2 WHERE id = $1",
      values: [this.data.id, position],
    })) as DatabaseChannel;

    const channels = (
      await query<{ id: number }>({
        text: "SELECT id FROM channels WHERE guild_id = $1 ORDER BY position ASC",
        values: [this.data.guild_id],
      })
    ).rows.map((x) => x.id);

    send({
      type: "ChannelPositionUpdate",
      guild: this.data.guild_id,
      payload: {
        channels,
      },
    });

    this.data = newChannel;
    return this;
  }

  public async edit(options: UpdateChannelOptions) {
    const setClause = Object.entries(options)
      .map((x, i) => `${x[0]} = $${i + 2}`)
      .join(", ");

    const queryText = `
        UPDATE channels
        SET ${setClause}
        WHERE id = $1
        RETURNING *;
      `;

    const values = [this.data.id, ...Object.values(options)];

    const result = await query<DatabaseChannel>({
      text: queryText,
      values: values,
    });

    send({
      type: "ChannelUpdate",
      guild: this.data.guild_id,
      channel: this.data.id,
      payload: {
        channel: this.data,
      },
    });

    return new SyChannel(result.rows[0]);
  }

  public static async createDMChannel(): Promise<SyChannel> {
    return new SyChannel(
      (await queryOne<DatabaseChannel>({
        text: "INSERT INTO channels (type) VALUES ('dm') RETURNING *;",
        values: [],
      })) as DatabaseChannel,
    );
  }

  public static async createServerChannel(
    serverId: number,
    options: CreateChannelOptions,
  ): Promise<SyChannel> {
    const channel = new SyChannel(
      (await queryOne<DatabaseChannel>({
        text: "INSERT INTO channels (type, guild_id, name) VALUES ('channel', $1, $2) RETURNING *;",
        values: [serverId, options.name],
      })) as DatabaseChannel,
    );

    send({
      type: "ChannelCreate",
      guild: serverId,
      payload: {
        channel: channel.data,
      },
    });

    return channel;
  }

  public static async fetch(id: number): Promise<SyChannel> {
    return new SyChannel(
      (
        await query<DatabaseChannel>({
          text: "SELECT * FROM channels WHERE id = $1",
          values: [id],
        })
      ).rows[0],
    );
  }

  public static async exists(id: number): Promise<boolean> {
    return (
      (await queryOne<DatabaseChannel>({
        text: "SELECT * FROM channels WHERE id = $1",
        values: [id],
      })) !== null
    );
  }

  toJSON() {
    return this.data;
  }
}
