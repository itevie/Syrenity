import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { JSONSchemaType } from "ajv";
import * as ws from '../../../ws/ws';
import * as permissions from '../../../util/permissions';
import config from '../../../config.json';

interface CreateMessageBody {
  content: string;
}

export default {
  method: "POST",
  path: "/api/channels/:id/messages",
  handler: async (req, res) => {
    const channelId = parseInt(req.params.id);

    // Fetch channel
    const channel = await database.actions.channels.fetch(channelId);

    // Just create it
    const message = await database.actions.channels.messages.create({
      channelId: channel.id,
      authorId: (req.user as User).id,
      content: req.body.content,
    });

    // Broadcast
    ws.sendMessage({
      type: "MESSAGE_CREATE",
      message,
      guildId: channel.guild_id,
      channelId: channel.id,
    });

    return res.status(200).send(message);
  },
  details: {
    auth: {
      loggedIn: true,
    },

    params: {
      id: {
        is: "channel",
        canView: true,
      }
    },

    requiresPermissions: [
      permissions.PermissionBitfield.CREATE_MESSAGE
    ],

    body: {
      schema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            minLength: 1,
            maxLength: config.validity.messages.maxLength
          }
        },
        required: ["content"],
        errorMessage: {
          properties: {
            content: "Content is ugh"
          }
        }
      } as JSONSchemaType<CreateMessageBody>
    }
  }
} as RouteDetails