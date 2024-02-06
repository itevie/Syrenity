import * as database from '../../../database';
import { RouteDetails } from "../../../types/route";

export default {
  method: "GET",
  path: "/api/guilds/:id/channels",
  handler: async (req, res) => {
    // Obtain details
    const guildId = parseInt(req.params.id);

    // Obtain channels
    const channels = await database.actions.guilds.fetchChannels(guildId);

    return res.status(200).send({
      channels: channels,
    }); 
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      id: {
        is: 'guild',
        canView: true
      }
    }
  }
} as RouteDetails