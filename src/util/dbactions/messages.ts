import { actions, query } from "../database";

export interface MessageUpdateOptions {
    content?: string,
}

export interface CreateMessageOptions {
    content: string,
    authorId: number,
    channelId: number,
}

export interface MessageQueryOptions {
    channelId: number,
    guildId?: number,
}

export default {
    fetch: async (id: number): Promise<Message> => {
        return (await query({
            text: `SELECT * FROM messages WHERE id = $1`,
            values: [id],
            noRowsError: {
                message: `The message with ID ${id} does not exist`
            },
            cache: {
                name: "MessageByID",
                key: id,
            }
        })).rows[0] as Message;
    },

    exists: async (id: number): Promise<boolean> => {
        return (await query({
            text: `SELECT 1 FROM messages WHERE id = $1`,
            values: [id],
            cache: {
                name: "MessageExists",
                key: id,
            }
        })).rows.length !== 0;
    },

    delete: async (id: number): Promise<void> => {
        await query({
            text: `DELETE FROM messages WHERE id = $1`,
            values: [id],
            cache: {
                clear: {
                    names: ["MessageExists", "MessageByID"],
                    keys: [id],
                }
            }
        });
    },

    create: async (options: CreateMessageOptions): Promise<Message> => {
        return (await query({
            text: `
                INSERT INTO messages(channel_id, content, author_id, created_at)
                    VALUES(${options.channelId}, $1, ${options.authorId}, CURRENT_TIMESTAMP)
                    RETURNING *
            `,
            values: [options.content]
        })).rows[0] as Message;
    },

    setPinStatus: async (messageId: number, isPinned: boolean): Promise<void> => {
        await query({
            text: `UPDATE messages SET is_pinned = $1 WHERE id = $2`,
            values: [isPinned, messageId],
            cache: {
                clear: {
                    names: ["MessageByID", "MessageExists"],
                    keys: [messageId]
                }
            }
        })
    },

    editMessage: async (id: number, options: MessageUpdateOptions): Promise<Message> => {
        // This is in here cause scary
        if (options.content) {
            await query({
                text: `UPDATE messages SET content = $2, is_edited = true WHERE id = $1;`,
                values: [id, options.content],
                cache: {
                    clear: {
                        names: ["MessageByID", "MessageExists"],
                        keys: [id]
                    }
                }
            })
        }

        return await actions.messages.fetch(id);
    },
}