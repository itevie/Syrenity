import * as database from '../database';
import * as errors from '../errors';
import { CacheKey } from '../util/CacheManager';
import { defaultPermissions } from '../util/permissions';

export default {
  getAtEveryone: async (guildId: number): Promise<Role> => {
    const res = await database.query({
      text: `SELECT * FROM roles WHERE guild_id = $1 AND is_everyone = true`,
      values: [guildId]
    });

    if (!res.rows[0])
      throw new errors.DatabaseError({
        error: new Error(),
        message: `Cannot guild @everyone for guild ${guildId}`,
        statusCode: 500
      });

    return res.rows[0] as Role;
  },

  create: async (guildId: number, name: string, bitfield: number): Promise<Role> => {
    const res = await database.query({
      text: database.queries.CREATE_ROLE,
      values: [guildId, name, bitfield]
    });

    return res.rows[0] as Role;
  },

  createAtEveryone: async (guildId: number): Promise<Role> => {
    const res = await database.query({
      text: database.queries.CREATE_EVERYONE_ROLE,
      values: [guildId, defaultPermissions]
    });

    return res.rows[0] as Role;
  },

  fetchRoles: async (guildId: number): Promise<{[key: number]: Role}> => {
    const res = await database.query({
      text: database.queries.FETCH_GUILD_ROLES,
      values: [guildId],
      cache: {
        key: CacheKey.GUILD_ROLES,
        name: guildId,
      }
    });

    const rows: Role[] = res.rows;
    const data: {[key: number]: Role} = {};

    for (const i in rows) {
      data[rows[i].id] = rows[0];
    }

    return data;
  },

  exists: async (roleId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.ROLE_EXISTS,
      values: [roleId],
      cache: {
        key: CacheKey.ROLE_EXISTS,
        name: roleId,
      }
    });

    return res.rows[0] ? true : false;
  },

  fetchRole: async (roleId: number): Promise<Role> => {
    const res = await database.query({
      text: database.queries.FETCH_ROLE,
      values: [roleId],
      cache: {
        key: CacheKey.ROLE,
        name: roleId,
      }
    });

    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch role ${roleId}`,
        error: new Error(),
        statusCode: 404,
      });

    return res.rows[0] as Role;
  }
}