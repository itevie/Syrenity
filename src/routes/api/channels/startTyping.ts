import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import PermissionBitfield from "../../../util/PermissionBitfield";
import * as ws from '../../../ws/ws';

export default {
  method: "POST",
  path: "/api/channels/:id/typing",
  handler: async (req, res) => {
    // Get the details
    const channelId = parseInt(req.params.id);

    // Fetch channel
    const channel = await database.actions.channels.fetch(channelId);

    // Send the event
    ws.sendMessage({
      type: "TYPING_START",
      channelId: channel.id,
      guildId: channel.guild_id,
      data: {
        user_id: (req.user as User).id,
        channel_id: channel.id,
        guild_id: channel.guild_id
      }
    });

    return res.status(204).end();
  },
  details: {
    params: {
      id: {
        is: "channel",
        canView: true,
      }
    },

    permissions: {
      required: [
        PermissionBitfield.CREATE_MESSAGE,
      ]
    }
  }
} as RouteDetails