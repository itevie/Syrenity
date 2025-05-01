import { SystemMessageTypes } from "../broadcasting/SystemMessageTypes";
import { query, queryOne } from "../database/database";
import SyChannel from "./Channel";
import SyReaction, { DatabaseReaction, UsefulReaction } from "./Reaction";

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
}

export type ExpandedMessage = DatabaseMessage & {
  reactions: UsefulReaction[];
};

export interface CreateMessageOptions {
  content: string;
  authorId: number;
  channelId: number;
  isSystem?: boolean;
  systemType?: keyof SystemMessageTypes;
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

  public async setPinned(value: boolean): Promise<SyMessage> {
    const result = (await queryOne<DatabaseMessage>({
      text: "UPDATE messages SET is_pinned = $2 WHERE id = $1 RETURNING *",
      values: [this.data.id, value],
    })) as DatabaseMessage;

    this.data = result;
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
    return new SyMessage(
      (
        await query<DatabaseMessage>({
          text: `
                INSERT INTO messages(channel_id, content, author_id, created_at, is_system, sys_type)
                    VALUES(${options.channelId}, $1, ${options.authorId}, CURRENT_TIMESTAMP, $2, $3)
                    RETURNING *
            `,
          values: [
            options.content,
            options.isSystem || false,
            options.systemType || null,
          ],
        })
      ).rows[0],
    );
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
