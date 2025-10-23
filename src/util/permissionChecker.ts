import SyChannel from "../models/Channel";
import SyServer from "../models/Servers";
import { actions, query } from "./database";
import permissionsBitfield from "./PermissionBitfield";

/**
 * Checks if the user can view the specified resource
 * @param user The user in question
 * @param what The resource to be checked
 * @param id The ID of the resource (assumed to be existent)
 */
export async function canView(
  user: User,
  what: Resource,
  id: number,
): Promise<boolean> {
  switch (what) {
    case "guild":
      // Simple has member check will suit it
      let r = await actions.guilds.hasMember(id, user.id);
      return r;
    case "message":
      const message = await actions.messages.fetch(id);
      const channel = await SyChannel.fetch(message.channel_id);

      // Check if relationship
      if (channel.data.type === "dm") {
        const relationship = await actions.relationships.fetchForChannel(
          channel.data.id,
        );

        // Check if user is one of them
        return relationship.user1 === user.id || relationship.user2 === user.id;
      }

      // Fetch guild and check if has permission
      const guild = await SyServer.fetch(channel.data.guild_id);
      const hasPerm = await hasPermission({
        permission: permissionsBitfield.ReadChannelHistory,
        guild: guild.data,
        channel: channel.data,
        user,
      });

      return hasPerm;
    case "channel":
      const cresult = (
        await query({
          text: `
                    SELECT
                        CASE
                            -- Check if the channel ID is a relationship, and the user is in it
                            WHEN EXISTS (
                                SELECT 1
                                    FROM relationships
                                    WHERE channel_id = $2
                                        AND (user1 = $1 OR user2 = $1)
                            )

                            -- Check if the channel is from a server which the user is from
                            OR EXISTS (
                                SELECT 1 FROM (
                                    SELECT
                                        CASE
                                            WHEN m.user_id IS NOT NULL THEN TRUE
                                            ELSE FALSE
                                        END AS result
                                    FROM
                                        channels c
                                    JOIN
                                        guilds g ON c.guild_id = g.id
                                    LEFT JOIN
                                        members m ON g.id = m.guild_id AND m.user_id = $1
                                    WHERE
                                        c.id = $2
                                ) AS result
                                WHERE result = true
                            ) THEN TRUE
                            ELSE FALSE
                        END AS result;
                `,
          values: [user.id, id],
        })
      ).rows[0].result;

      return cresult;
    case "user":
      if (user.id === id) return true;
      const result = (
        await query({
          text: `
                    SELECT
                        CASE
                            -- Check if the two users contain a mutural server
                            WHEN EXISTS (
                                SELECT 1
                                    FROM members
                                    WHERE user_id IN ($1, $2)
                                    GROUP BY guild_id
                                    HAVING COUNT(DISTINCT user_id) = 2
                            )

                            -- Check if the two users have a relationship
                            OR EXISTS (
                                SELECT 1
                                    FROM relationships
                                    WHERE user1 = $1 AND user1 = $2
                                        OR user1 = $2 AND user2 = $1
                            )
                            THEN TRUE
                            ELSE FALSE
                        END AS result;
                `,
          values: [user.id, id],
        })
      ).rows[0].result;

      return result;
    default:
      console.error(`Can view not implemented for ${what}`);
      process.exit(0);
  }
}

export function bitfieldToStringArray(permissions: number): string[] {
  let result: string[] = [];

  for (const i in permissionsBitfield) {
    if (permissions & permissionsBitfield[i]) {
      result.push(i);
    }
  }

  return result;
}

interface PermissionCheckDetails {
  user: User;
  channel?: Channel;
  guild: Server;
  permission: number;
}

export function getFullBitfield(): number {
  let base = 0;
  for (const bitfield in permissionsBitfield)
    base |= permissionsBitfield[bitfield];
  return base;
}

export async function getBitfieldForMember({
  user,
  channel,
  guild,
}: {
  user: User;
  channel?: Channel;
  guild: Server;
}): Promise<number> {
  if (user.id === guild.owner_id) return getFullBitfield();

  let currentBitfield = 0;

  // Get guild @everyone
  const everyone = await actions.roles.getEveryoneFor(guild.id);

  // Apply them
  currentBitfield |= everyone.bitfield_allow;
  currentBitfield &= ~everyone.bitfield_deny;

  // Apply channel overrides
  if (channel) {
    const everyoneOverrides = await actions.channels.fetchRoleOverride(
      channel.id,
      everyone.id,
    );
    if (everyoneOverrides) {
      currentBitfield |= everyoneOverrides.bitfield_allow;
      currentBitfield &= ~everyoneOverrides.bitfield_deny;
    }
  }

  return currentBitfield;
}

export async function hasPermission({
  user,
  channel,
  guild,
  permission,
}: PermissionCheckDetails): Promise<boolean> {
  // Check if the user is the owner of the server
  if (user.id === guild.owner_id) {
    return true;
  }

  let currentBitfield = await getBitfieldForMember({ user, channel, guild });

  return (currentBitfield & permission) !== 0;
}
