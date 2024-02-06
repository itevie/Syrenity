import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { JSONSchemaType } from "ajv";
import config from "../../../config.json";
import * as permissions from "../../../util/permissions";
import {PermissionBitfield} from "../../../util/permissions";
import { sendMessage } from "../../../ws/ws";

interface UpdateGuildOptions {
  name?: string;
}

const permissionsNeeded: Map<keyof UpdateGuildOptions, keyof typeof PermissionBitfield> = new Map();
permissionsNeeded.set("name", "MANAGE_SERVER");

export default {
  method: "PATCH",
  path: "/api/guilds/:id",
  handler: async (req, res) => {
    // Get the details
    const user = (req.user as User);
    const guildId = parseInt(req.params.id);
    const guild = await database.actions.guilds.fetch(guildId);
    const options = req.body as UpdateGuildOptions;

    // Check permissions
    for (const i in options) {
      const option = i as keyof UpdateGuildOptions;

      // Check if it requires permissions
      if (permissionsNeeded.has(option)) {
        const permission = permissionsNeeded.get(option) as keyof typeof PermissionBitfield;

        // Check if user has the permission
        if (!(await permissions.hasPermission({
          guildId: guildId,
          userId: user.id,
          permission: PermissionBitfield[permission]
        })))
          return res.status(401).send({
            message: `Missing permission ${permission} for option ${i}`
          });
      }
    }

    // Go through all of the options that are defined
    if (options.name) {
      await database.actions.guilds.setName(guildId, options.name);
    }

    const newGuild = await database.actions.guilds.fetch(guildId);

    sendMessage({
      guildId,
      type: "GUILD_UPDATE",
      data: newGuild
    });

    return res.status(200).send(newGuild);
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      id: {
        is: "guild",
        canView: true,
      }
    },
    body: {
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: config.validity.guildName.minLength,
            maxLength: config.validity.guildName.maxLength
          }
        }
      } as JSONSchemaType<UpdateGuildOptions>
    }
  }
} as RouteDetails