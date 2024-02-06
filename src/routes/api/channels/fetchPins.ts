import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import PermissionBitfield from "../../../util/PermissionBitfield";

export default {
  method: "GET",
  path: "/api/channels/:channelId/pins",
  handler: async (req, res) => {
    // Fetch details
    const channelId = parseInt(req.params.channelId as string);

    const pins = await database.actions.messages.pins.fetchAll(channelId);

    // Done
    return res.status(200).send({
      messages: pins
    });
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