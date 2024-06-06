import { query } from "../database";

export interface FetchMessageOptions {
    amount?: number | null,
    startAtId?: number | null,
    oldestFirst?: boolean | null,
    isPinned?: boolean | null,
    fromAuthor?: number | null,
}

export interface CreateMessageOptions {
    content: string,
    authorId: number,
    channelId: number,
}

export default {
    fetch: async (id: number): Promise<Channel> => {
        return (await query({
            text: `SELECT * FROM channels WHERE id = $1`,
            values: [id],
            noRowsError: {
                message: `The channel with ID ${id} does not exist`
            }
        })).rows[0] as Channel;
    },

    exists: async (id: number): Promise<boolean> => {
        return (await query({
            text: `SELECT 1 FROM channels WHERE id = $1`,
            values: [id],
        })).rows.length !== 0;
    },

    createMessage: async (options: CreateMessageOptions): Promise<Message> => {
        return (await query({
            text: `
                INSERT INTO messages(channel_id, content, author_id, created_at)
                    VALUES(${options.channelId}, $1, ${options.authorId}, CURRENT_TIMESTAMP)
                    RETURNING *
            `,
            values: [options.content]
        })).rows[0] as Message;
    },  

    fetchMessages: async(channelId: number, options: FetchMessageOptions): Promise<Message[]> => {
        const q = `
            SELECT * FROM messages
                WHERE channel_id = ${channelId}
                    ${options.startAtId ? `AND id < ${options.startAtId}` : ""}
                    ${options.isPinned ? `AND is_pinned = ${options.isPinned}` : ""}
                    ${options.fromAuthor ? `AND author_id = ${options.fromAuthor}` : ""}
                ORDER BY created_at ${options.oldestFirst ? "ASC" : "DESC"}
                LIMIT ${options.amount ?? 20}
        `;

        return (await query({
            text: q,
            values: []
        })).rows as Message[];
    }
}