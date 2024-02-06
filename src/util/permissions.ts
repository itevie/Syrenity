import Logger from '../Logger';
import * as database from '../database';
import PermissionBitfield from './PermissionBitfield';

export const defaultPermissions = PermissionBitfield.CREATE_MESSAGE
  | PermissionBitfield.ADD_REACTIONS
  | PermissionBitfield.ATTACH_FILES
  | PermissionBitfield.CHANGE_NICKNAME
  | PermissionBitfield.CREATE_INVITE
  | PermissionBitfield.EMBED_LINKS
  | PermissionBitfield.MASS_MENTIONS
  | PermissionBitfield.READ_MESSAGE_HISTORY
  | PermissionBitfield.VIEW_CHANNELS;
export const fullPermissions = 
  Object.values(PermissionBitfield).reduce((a, b) => a | b, 0);

export async function updateGuildEveryones() {
  const logger = new Logger("@everyone");
  const guilds = (await database.query({
    text: `SELECT id FROM guilds`,
    values: []
  })).rows as {id: number}[];

  for (const guild of guilds) {
    try {
      const everyone = await database.actions.guilds.roles.getAtEveryone(guild.id);
    } catch {
      logger.log(`Guild ${guild.id} does not have an @everyone`);
      await database.actions.guilds.roles.createAtEveryone(guild.id);
      logger.log(`Created @everyone for ${guild.id}`);
    }
  }
}

export async function canUserView(what: 'channel' | 'guild', id: number, userId: number): Promise<boolean> {
  switch (what) {
    case "guild":
      // Check if the guild contains the userId
      const hasMember = await database.actions.guilds.members.has(id, userId);

      return hasMember;
    case "channel":
      const channel = await database.actions.channels.fetch(id);

      // Check if the channel is a relationship
      if (await database.actions.relationships.isRelationship(channel.id)) {
        const relationship = await database.actions.relationships.fetchByChannelId(channel.id);

        return relationship.user1 === userId || relationship.user2 === userId;
      }

      return await hasPermission({
        guildId: channel.guild_id,
        channelId: channel.id,
        userId: userId,
        permission: PermissionBitfield.VIEW_CHANNELS
      });
  }
}

export async function hasPermission(options: {
  guildId: number,
  channelId?: number,
  userId: number,
  permission: number
}): Promise<boolean> {
  // Check if user is a member first
  if (await canUserView('guild', options.guildId, options.userId) == false)
    return false;

  // Fetch guild
  const guild = await database.actions.guilds.fetch(options.guildId);

  // Check if the user is the owner
  if (guild.owner_id === options.userId)
    return true;

  // Compute bitfield
  const bitfield = await computeBitField({
    guildId: options.guildId,
    channelId: options.channelId,
    userId: options.userId
  });

  // Check if user has permission defined or administrator
  if (
    bitfield & options.permission ||
    bitfield & PermissionBitfield.ADMINISTRATOR
  ) {
    return true;
  } else return false;
}


export async function computeBitField(options: {
  guildId: number;
  channelId?: number;
  userId: number;
}): Promise<number> {
  // Fetch details
  const guild = await database.actions.guilds.fetch(options.guildId);
  const user = await database.actions.users.fetch(options.userId);
  const member = await database.actions.guilds.members.fetch(options.guildId, options.userId);

  // Check if the member is the owner of the guild
  if (guild.owner_id === user.id)
    return fullPermissions;

  const atEveryone = await database.actions.guilds.roles.getAtEveryone(options.guildId) || defaultPermissions;
  const roles = await database.actions.guilds.members.fetchRoles(options.userId, options.guildId);

  // Set to the @everyone
  let bitfield = atEveryone.permissions_bitfield;

  // Add all of the user's roles
  for (const role of roles) {
    bitfield = bitfield | role.permissions_bitfield;
  }
  
  // Check if the user has ADMINISTRATOR
  if (bitfield & PermissionBitfield.ADMINISTRATOR)
    bitfield = fullPermissions;

  return bitfield;
}

export {PermissionBitfield};