import express from "express";
import { PermissionDetails } from "../types/route";
import { actions } from "../util/database";
import { bitfieldToStringArray, hasPermission } from "../util/permissionChecker";
import AuthenticationError from "../errors/AuthenticationError";

export default async function validatePermissions(
    req: express.Request,
    res: express.Response,
    permissionDetails: PermissionDetails
): Promise<void | AuthenticationError> {
    let guild: null | Guild = null;
    let channel: null | Channel = null;

    // Try get guild
    if (permissionDetails.guildParam) {
        let id = parseInt(req.params[permissionDetails.guildParam]);
        guild = await actions.guilds.fetch(id);
    }

    // Try get channel
    if (permissionDetails.channelParam) {
        let id = parseInt(req.params[permissionDetails.channelParam])
        channel = await actions.channels.fetch(id);

        // Check to set guild
        if (!guild && channel.type === "channel") {
            guild = await actions.guilds.fetch(channel.guild_id);
        }
    }

    // Check if guild is null
    if (guild === null) {
        return new AuthenticationError({
            message: `Failed to resolve guild to fetch permissions`,
            statusCode: 500,
            at: ``,
            errorCode: "UnknownServerError"
        });
    }

    const gotPermissionYo = await hasPermission({
        user: req.user as User,
        guild,
        channel: channel ?? undefined,
        permission: permissionDetails.permissions
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
            }
        });
    }
}