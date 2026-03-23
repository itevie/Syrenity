import express from "express";
import { PermissionDetails } from "../types/route";
import { actions } from "../util/database";
import {
  bitfieldToStringArray,
  hasPermission,
} from "../util/permissionChecker";
import AuthenticationError from "../errors/AuthenticationError";
import SyReaction from "../models/Reaction";
import SyRelationship from "../models/Relationship";
import permissionsBitfield from "../util/PermissionBitfield";
import SyChannel from "../models/Channel";
import SyServer from "../models/Servers";
import SyMessage from "../models/Message";
import SyUser from "../models/User";

const DM_PERMISSIONS =
  permissionsBitfield.CreateMessages | permissionsBitfield.ReadChannelHistory;

export default async function validatePermissions(
  req: express.Request,
  res: express.Response,
  permissionDetails: PermissionDetails
): Promise<void | AuthenticationError> {
  let guild: null | SyServer = null;
  let channel: null | SyChannel = null;

  // Try get guild
  if (permissionDetails.guildParam) {
    let id = parseInt(req.params[permissionDetails.guildParam]);
    guild = await SyServer.fetch(id);
  }

  // Try get channel
  if (permissionDetails.channelParam) {
    let id = parseInt(req.params[permissionDetails.channelParam]);
    channel = await SyChannel.fetch(id);

    // Check to set guild
    if (!guild && channel.data.type === "channel") {
      guild = await SyServer.fetch(channel.data.guild_id);
    } else if (channel.data.type === "dm") {
      const relationship = await SyRelationship.fetchByChannel(channel.data.id);
      const user = req.user as SyUser;
      if (
        relationship.data.user1 !== user.data.id &&
        relationship.data.user2 !== user.data.id
      )
        return new AuthenticationError({
          message: "You are not apart of this DM channel",
          statusCode: 401,
          errorCode: "NotARecipient",
        });

      if (!(permissionDetails.permissions & DM_PERMISSIONS))
        return new AuthenticationError({
          message: "Cannot perform this action on DMs",
          errorCode: "MissingPermissions",
          statusCode: 401,
        });
      return;
    }
  }

  // Check if guild is null
  if (guild === null) {
    return new AuthenticationError({
      message: `Failed to resolve guild to fetch permissions`,
      statusCode: 500,
      at: ``,
      errorCode: "UnknownServerError",
    });
  }

  // Check if self
  const channelMessageRegex =
    /^\/api(?:\/v\d+)?\/channels\/[^/]+\/messages\/([^/]+)$/;

  const match = req.path.match(channelMessageRegex);

  if (match && (req.method === "POST" || req.method === "DELETE")) {
    const messageId = Number(match[1]);

    if (!Number.isNaN(messageId)) {
      const message = await SyMessage.fetch(messageId);
      if (message.data.author_id === (req.user as SyUser).data.id) {
        return;
      }
    }
  }

  const gotPermissionYo = await hasPermission({
    user: req.user as SyUser,
    guild: guild,
    channel: channel ?? undefined,
    permission: permissionDetails.permissions,
  });

  if (!gotPermissionYo) {
    return new AuthenticationError({
      message: `You do not have permission to view this resource (need permissions: ${bitfieldToStringArray(permissionDetails.permissions)})`,
      statusCode: 401,
      at: ``,
      errorCode: "MissingPermissions",
      data: {
        bitfield: permissionDetails.permissions,
        bitfieldString: bitfieldToStringArray(permissionDetails.permissions),
      },
    });
  }
}
