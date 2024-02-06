import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { JSONSchemaType } from "ajv";
import * as ws from '../../../ws/ws';
import * as permissions from '../../../util/permissions';
import uploadToImgur from "../../../util/uploadToImgur";

interface CreateChannelBody {
  name: string;
}

export default {
  method: "POST",
  path: "/api/guilds/:guildId/channels",
  handler: async (req, res) => {
    const guildId = parseInt(req.params.guildId);

    // Create channel
    const channel = await database.actions.channels.create(guildId, req.body.name);

    // Broudcast event
    ws.sendMessage({
      type: "CHANNEL_CREATE",
      guildId: guildId,
      data: {
        channel,
      }
    });

    return res.status(200).send(channel);
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      guildId: {
        is: "guild",
        canView: true,
      }
    },
    permissions: {
      required: [
        permissions.PermissionBitfield.MANAGE_CHANNELS
      ]
    },
    body: {
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 15,
          }
        },
        required: ["name"],
        errorMessage: {
          properties: {
            name: "Name must be 2-15 characters",
          }
        }
      } as JSONSchemaType<CreateChannelBody>
    }
  }
} as RouteDetails