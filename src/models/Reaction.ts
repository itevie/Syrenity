import { query, queryOne } from "../database/database";
import DatabaseError from "../errors/DatabaseError";
import { send } from "../ws/websocketUtil";
import SyChannel from "./Channel";
import SyMessage from "./Message";

export interface DatabaseReaction {
  message_id: number;
  user_id: number;
  emoji: string;
  created_at: Date;
}

export interface UsefulReaction {
  message_id: number;
  amount: number;
  emoji: string;
  users: number[];
}

export default class SyReaction {
  constructor(public data: DatabaseReaction) {}

  public async remove(): Promise<void> {
    const message = await SyMessage.fetch(this.data.message_id);
    const channel = await message.fetchChannel();

    await queryOne({
      text: "DELETE FROM reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3",
      values: [this.data.message_id, this.data.user_id, this.data.emoji],
    });

    send({
      type: "MessageReactionRemove",
      channel: channel.data.id,
      guild: channel.data.guild_id,
      payload: {
        reaction: this.data,
        new_message: await (
          await SyMessage.fetch(this.data.message_id)
        ).expand(),
      },
    });
  }

  public static makeUseful(reactions: DatabaseReaction[]): UsefulReaction[] {
    return Object.entries(
      reactions.reduce<{ [key: string]: UsefulReaction }>((p, c) => {
        return {
          ...p,
          [c.emoji]: {
            amount: (p[c.emoji]?.amount ?? 0) + 1,
            message_id: c.message_id,
            created_at: c.created_at,
            emoji: c.emoji,
            users: [...(p[c.emoji]?.users ?? []), c.user_id],
          },
        };
      }, {}),
    ).map((x) => x[1]);
  }

  public static async removeAll(messageId: number): Promise<void> {
    await queryOne({
      text: "DELETE FROM reactions WHERE message_id = $1",
      values: [messageId],
    });
  }

  public static async removeAllByEmoji(
    messageId: number,
    emoji: string,
  ): Promise<void> {
    await queryOne({
      text: "DELETE FROM reactions WHERE message_id = $1 AND emoji = $2",
      values: [messageId, emoji],
    });
  }

  public static async getFor(messageId: number): Promise<SyReaction[]> {
    return (
      await query<DatabaseReaction>({
        text: "SELECT * FROM reactions WHERE message_id = $1",
        values: [messageId],
      })
    ).rows.map((x) => new SyReaction(x));
  }
  public static async getSpecific(
    messageId: number,
    userId: number,
    emoji: string,
  ): Promise<SyReaction> {
    const result = await queryOne<DatabaseReaction>({
      text: "SELECT * FROM reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3",
      values: [messageId, userId, emoji],
    });

    if (result === null)
      throw new DatabaseError({
        message: `The user has not reacted with that emoji`,
        errorCode: "NonexistentResource",
        statusCode: 400,
      });

    console.log(result);

    return new SyReaction(result);
  }

  public static async create(
    messageId: number,
    userId: number,
    emoji: string,
  ): Promise<SyReaction> {
    const message = await SyMessage.fetch(messageId);
    const channel = await message.fetchChannel();

    const reaction = new SyReaction(
      (await queryOne<DatabaseReaction>({
        text: "INSERT INTO reactions (message_id, user_id, emoji) VALUES ($1, $2, $3) RETURNING *",
        values: [messageId, userId, emoji],
      })) as DatabaseReaction,
    );

    send({
      type: "MessageReactionAdd",
      channel: channel.data.id,
      guild: channel.data.guild_id,
      payload: {
        reaction: reaction.data,
        new_message: await (await SyMessage.fetch(messageId)).expand(),
      },
    });

    return reaction;
  }

  toJSON() {
    return this.data;
  }
}
