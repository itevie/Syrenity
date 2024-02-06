import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { JSONSchemaType } from "ajv";
import * as ws from '../../../ws/ws';
import * as permissions from '../../../util/permissions';
import config from '../../../config.json';

interface UpdateMessageBody {
  content?: string;
}

export default {
  method: "PATCH",
  path: "/api/channels/:id/messages/:messageId",
  handler: async (req, res) => {
    const messageId = parseInt(req.params.messageId);
    const channel = await database.actions.channels.fetch(parseInt(req.params.id));

    let updatedMessage = await database.actions.messages.fetch(messageId);

    // Check if update content
    if (req.body.content) {
      updatedMessage = await database.actions.messages.setContent(messageId, req.body.content);
    }

    // Broadcast
    ws.sendMessage({
      type: "MESSAGE_UPDATE",
      message: updatedMessage,
      guildId: channel.guild_id,
      channelId: channel.id,
    });

    return res.status(200).send(updatedMessage);
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

    body: {
      schema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            minLength: 1,
            maxLength: config.validity.messages.maxLength
          }
        }
      } as JSONSchemaType<UpdateMessageBody>
    }
  }
} as RouteDetails