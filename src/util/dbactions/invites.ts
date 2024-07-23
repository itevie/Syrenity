import DatabaseError from "../../errors/DatabaseError";
import { query } from "../database"
import { randomID } from "../util";

interface CreateInviteOptions {
    id: string,
    guildId: number,
    createdBy: number,
    channelId?: number | null,
    maxUses?: number | null,
    expiresIn?: number | null,
}

export default {
    fetch: async (id: string): Promise<Invite> => {
        return (await query({
            text: `SELECT * FROM invites WHERE id = $1;`,
            values: [id],
            noRowsError: {
                message: `The invite ${id} does not exist`,
                errorCode: "NonexistentResource",
            }
        })).rows[0] as Invite;
    },

    fetchAll: async (guildId: number): Promise<Invite[]> => {
        return (await query({
            text: `SELECT * FROM invites WHERE guild_id = $1`,
            values: [guildId]
        })).rows as Invite[];
    },

    exists: async (id: string): Promise<boolean> => {
        return (await query({
            text: `SELECT 1 FROM invites WHERE id = $1;`,
            values: [id],
        })).rows.length !== 0;
    },

    delete: async (id: string): Promise<void> => {
        await query({
            text: `DELETE FROM invites WHERE id = $1`,
            values: [id],
        });
    },

    create: async (options: CreateInviteOptions): Promise<Invite> => {
        return (await query({
            text: `
                INSERT INTO invites(id, guild_id, channel_id, created_by, expires_in, max_uses)
                    VALUES($1, $2, $3, $4, $5, $6)
                    RETURNING *;
            `,
            values: [options.id, options.guildId, options.channelId, options.createdBy, options.expiresIn, options.maxUses]
        })).rows[0] as Invite;
    },

    generateInviteID: async (): Promise<string> => {
        for (let i = 0; i != 20; i++) {
            let id = randomID(6);
            let invite = await query({
                text: `SELECT * FROM invites WHERE id = $1;`,
                values: [id]
            });

            if (invite.rowCount === 0)
                return id;
        }

        throw new DatabaseError({
            message: `Failed to generate a valid invite code`,
            errorCode: "UnknownServerError"
        });
    }
}