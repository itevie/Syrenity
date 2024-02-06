import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "GET",
  path: "/api/channels/:id/",
  handler: async (req, res) => {
    // Get the details
    const channelId = parseInt(req.params.id);

    // Fetch channel
    const channel = await database.actions.channels.fetch(channelId);

    return res.status(200).send(channel);
  },
  details: {
    params: {
      id: {
        is: "channel",
        canView: true,
      }
    },
  }
} as RouteDetails