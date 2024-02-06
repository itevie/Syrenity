import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { JSONSchemaType } from "ajv";
import * as ws from '../../../ws/ws';
import * as permissions from '../../../util/permissions';

interface CreateMessageBody {
  content: string;
}

export default {
  method: "DELETE",
  path: "/api/channels/:id/messages/:messageId",
  handler: async (req, res) => {
    const messageId = parseInt(req.params.messageId);
    const channelId = parseInt(req.params.id);

    // Fetch the message
    const message = await database.actions.messages.fetch(messageId);
    const channel = await database.actions.channels.fetch(channelId);

    // Check if it existed
    if (!message) {
      return res.status(404).send({
        message: `The message ${messageId} does not exist`,
        at: "params.messageId"
      });
    }

    // Check if author
    if (message.author_id !== (req.user as User).id && 
      !await permissions.hasPermission({ 
        guildId: channel.guild_id, 
        channelId: channel.id, 
        userId: (req.user as User).id, 
        permission: permissions.PermissionBitfield.MANAGE_MESSAGES
      }))
      return res.status(401).send({
        message: `You do not have permission to delete this message`,
        at: `params.messageId`
      });

    // Delete it
    await database.actions.messages.delete(message.id);

    // Broadcast
    ws.sendMessage({
      type: "MESSAGE_DELETE",
      guildId: channel.guild_id,
      channelId: channel.id,
      data: {
        message_id: message.id,
        channel_id: channel.id,
        guild_id: channel.guild_id,
      }
    });

    return res.status(200).send({
      message: "Message deleted"
    });
  },

  details: {
    auth: {
      loggedIn: true,
    },

    ratelimit: {
      amount: 50,
      every: {
        minutes: 2
      }
    },

    params: {
      id: {
        is: "channel",
        canView: true,
      }
    },
  }
} as RouteDetails