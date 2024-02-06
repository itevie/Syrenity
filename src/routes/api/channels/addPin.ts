import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import PermissionBitfield from "../../../util/PermissionBitfield";

export default {
  method: "PUT",
  path: "/api/channels/:channelId/pins/:messageId",
  handler: async (req, res) => {
    // Fetch details
    const channelId = parseInt(req.params.channelId as string);
    const messageId = parseInt(req.params.messageId as string);

    // Check if the message is already pinned
    if (await database.actions.messages.pins.isPinned(messageId)) {
      return res.status(204).end();
    }

    // Pin the message
    await database.actions.messages.pins.pin(messageId);

    // Done
    return res.status(204).end();
  },
  details: {
    params: {
      channelId: {
        is: "channel",
        canView: true,
      },

      messageId: {
        is: "message",
      }
    },

    permissions: {
      required: [
        PermissionBitfield.MANAGE_MESSAGES,
      ]
    }
  }
} as RouteDetails