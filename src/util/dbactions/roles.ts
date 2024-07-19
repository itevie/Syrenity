import { actions, query } from "../database";
import { defaultBitfield } from "../PermissionBitfield";

export default {
    createAtEveryone: async (guildId: number): Promise<Role> => {
        return (await query({
            text: `
                INSERT INTO roles(guild_id, name, is_everyone, bitfield_allow, bitfield_deny)
                    VALUES($1, 'everyone', true, $2, 0)
                    RETURNING *
            `,
            values: [guildId, defaultBitfield]
        })).rows[0] as Role;
    },

    getEveryoneFor: async (guildId: number): Promise<Role> => {
        const role = await query({
            text: `SELECT * FROM roles WHERE guild_id = $1 AND is_everyone = true;`,
            values: [guildId]
        });

        // If role not found, create it
        if (role.rows.length === 0)
            return await actions.roles.createAtEveryone(guildId);
        return role.rows[0] as Role;
    }
};