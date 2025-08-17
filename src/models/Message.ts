import { createSystemMessage } from "../broadcasting/systemMessageManager";
import { SystemMessageTypes } from "../broadcasting/SystemMessageTypes";
import { query, queryOne } from "../database/database";
import { send } from "../ws/websocketUtil";
import SyChannel from "./Channel";
import SyReaction, { UsefulReaction } from "./Reaction";
import SyUser from "./User";
import SyWebhook, { ExpandedWebhook } from "./Webhook";

export interface DatabaseMessage {
  id: number;
  channel_id: number;
  content: string;
  created_at: Date;
  author_id: number;
  is_pinned: number;
  is_edited: number;
  is_system: boolean;
  sys_type: string | null;
  webhook_id: string | null;
  proxy_id: string | null;
}

export type ExpandedMessage = DatabaseMessage & {
  reactions: UsefulReaction[];
  author: SyUser;
  webhook: ExpandedWebhook | null;
};

export interface CreateMessageOptions {
  content: string;
  authorId: number;
  channelId: number;
  isSystem?: boolean;
  systemType?: keyof SystemMessageTypes;
  withSend?: boolean;
  webhookId?: string;
}

export interface EditMessageOptions {
  content: string;
}

export default class SyMessage {
  constructor(public data: DatabaseMessage) {}

  public async expand(): Promise<ExpandedMessage> {
    return {
      ...this.data,
      reactions: SyReaction.makeUseful(
        (await SyReaction.getFor(this.data.id)).map((x) => x.data),
      ),
      webhook: !this.data.webhook_id
        ? null
        : await (await SyWebhook.fetch(this.data.webhook_id)).expand(),
      author: await SyUser.fetch(this.data.author_id),
    };
  }

  public async fetchChannel(): Promise<SyChannel> {
    return await SyChannel.fetch(this.data.channel_id);
  }

  public async delete(): Promise<void> {
    await query({
      text: "DELETE FROM messages WHERE id = $1",
      values: [this.data.id],
    });
  }

  public async setPinned(value: boolean, pinner: number): Promise<SyMessage> {
    const result = (await queryOne<DatabaseMessage>({
      text: "UPDATE messages SET is_pinned = $2 WHERE id = $1 RETURNING *",
      values: [this.data.id, value],
    })) as DatabaseMessage;

    if (value)
      createSystemMessage(this.data.channel_id, "MessagePinned", {
        message_id: this.data.id,
        pinned_by: pinner,
      });

    let channel = await this.fetchChannel();

    this.data = result;

    send({
      type: "MessageUpdate",
      guild: channel.data.guild_id,
      channel: channel.data.id,
      payload: {
        message: await this.expand(),
      },
    });

    return this;
  }

  public async edit(update: EditMessageOptions): Promise<SyMessage> {
    return new SyMessage(
      (
        await query<DatabaseMessage>({
          text: "UPDATE messages SET content = $2, is_edited = true WHERE id = $1 RETURNING *",
          values: [this.data.id, update.content],
        })
      ).rows[0],
    );
  }

  public static async create(
    options: CreateMessageOptions,
  ): Promise<SyMessage> {
    let message = new SyMessage(
      (
        await query<DatabaseMessage>({
          text: `
                INSERT INTO messages(channel_id, content, author_id, created_at, is_system, sys_type, webhook_id)
                    VALUES(${options.channelId}, $1, ${options.authorId}, CURRENT_TIMESTAMP, $2, $3, $4)
                    RETURNING *
            `,
          values: [
            options.content,
            options.isSystem || false,
            options.systemType || null,
            options.webhookId || null,
          ],
        })
      ).rows[0],
    );

    if (options.withSend) {
      let channel = await message.fetchChannel();
      send({
        guild: channel.data.guild_id,
        channel: channel.data.id,
        type: "MessageCreate",
        payload: {
          message: await message.expand(),
        },
      });
    }

    return message;
  }

  public static async fetch(id: number): Promise<SyMessage> {
    return new SyMessage(
      (
        await query<DatabaseMessage>({
          text: "SELECT * FROM messages WHERE id = $1",
          values: [id],
        })
      ).rows[0],
    );
  }

  public static async exists(id: number): Promise<boolean> {
    return (
      (
        await query({
          text: `SELECT 1 FROM messages WHERE id = $1`,
          values: [id],
          ignoreErrors: true,
        })
      ).rows.length !== 0
    );
  }

  toJSON() {
    return this.data;
  }
}
