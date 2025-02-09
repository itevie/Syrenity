import { assignedRolesToRoles } from "../converters";
import { actions, query } from "../database";
import { defaultBitfield } from "../PermissionBitfield";

interface CreateRoleOptions {
    name: string,
    bitfieldAllow: number,
    bitfieldDeny: number,
    color: string | null,
    rank: number,
}

export default {
    fetch: async (roleId: number): Promise<Role> => {
        return (await query({
            text: `SELECT * FROM roles WHERE id = $1;`,
            values: [roleId],
            noRowsError: {
                message: `A role with the ID ${roleId} was not found`,
                errorCode: "NonexistentResource"
            },
            cache: {
                name: "RoleByID",
                key: roleId,
            }
        })).rows[0] as Role;
    },

    create: async (guildId: number, data: CreateRoleOptions): Promise<Role> => {
        return (await query({
            text: `
                INSERT INTO roles (guild_id, name, is_everyone, color, bitfield_allow, bitfield_deny, rank)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
            `,
            values: [guildId, data.name, false, data.color, data.bitfieldAllow, data.bitfieldDeny, data.rank]
        })).rows[0] as Role;
    },

    createAtEveryone: async (guildId: number): Promise<Role> => {
        return (await query({
            text: `
                INSERT INTO roles(guild_id, name, is_everyone, bitfield_allow, bitfield_deny, rank)
                    VALUES($1, 'everyone', true, $2, 0, -1000)
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
    },

    getFullRolesForMember: async (memberId: number, guildId: number): Promise<Role[]> => {
        return await assignedRolesToRoles(await actions.roles.getRolesForMember(memberId, guildId));
    },

    getRolesForMember: async (memberId: number, guildId: number): Promise<AssignedRole[]> => {
        return (await query({
            text: `SELECT * FROM assigned_roles WHERE member_id = $1 AND guild_id = $2;`,
            values: [memberId, guildId]
        })).rows as AssignedRole[];
    },

    getRolesForGuild: async (guildId: number): Promise<Role[]> => {
        return (await query({
            text: `SELECT * FROM roles WHERE guild_id = $1;`,
            values: [guildId]
        })).rows as Role[];
    }
};