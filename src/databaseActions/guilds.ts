import * as database from '../database';
import * as errors from '../errors';
import { CacheKey } from '../util/CacheManager';
import members from './guildMembers';
import roles from './guildRoles';
import invites from './invites';

export default {
  fetch: async (guildId: number): Promise<Guild> => {
    const res = await database.query({
      text: database.queries.FETCH_GUILD,
      values: [guildId],
      cache: {
        key: CacheKey.GUILD,
        name: guildId
      }
    });

    // Check if it succeeded
    if (!res.rows[0])
      throw new errors.DatabaseError({
        message: `Failed to fetch guild ${guildId}`,
        error: new Error(),
        statusCode: 404,
      });

    // Set roles
    const guild = res.rows[0] as Guild;
    guild.roles = await database.actions.guilds.roles.fetchRoles(guild.id);

    return res.rows[0] as Guild;
  },

  exists: async (guildId: number): Promise<boolean> => {
    const res = await database.query({
      text: database.queries.FETCH_GUILD,
      values: [guildId],
      cache: {
        key: CacheKey.GUILD,
        name: guildId
      }
    });

    return res.rows[0] ? true : false;
  },

  fetchChannels: async (guildId: number): Promise<Channel[]> => {
    const res = await database.query({
      text: database.queries.FETCH_GUILD_CHANNELS,
      values: [guildId],
      cache: {
        key: CacheKey.GUILD_CHANNELS,
        name: "" + guildId
      }
    });
    
    return res.rows as Channel[];
  },

  create: async (name: string, avatar: string | null, ownerId: number): Promise<Guild> => {
    // Create guild
    const guild = (
      await database.query({
        text: database.queries.CREATE_GUILD,
        values: [name, avatar, ownerId]
      })
    ).rows[0] as Guild;

    // Create channel
    await database.actions.channels.create(guild.id, "channel");

    // Add owner as member
    await database.actions.guilds.members.add(guild.id, ownerId);

    // Done
    return guild;
  },

  setName: async (guildId: number, newName: string): Promise<Guild> => {
    const res = await database.query({
      text: database.queries.GUILD_SET_NAME,
      values: [guildId, newName],
      cache: {
        clearKeys: [
          CacheKey.GUILD,
        ],
        name: guildId,
      }
    });

    return res.rows[0];
  },

  members,
  roles,
}