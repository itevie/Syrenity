import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "GET",
  path: "/api/guilds/:id/",
  handler: async (req, res) => {
    // Get the details
    const guildId = parseInt(req.params.id);

    // Fetch guild
    const guild = await database.actions.guilds.fetch(guildId);

    return res.status(200).send(guild);
  },
  details: {
    params: {
      id: {
        is: "guild",
        canView: true,
      }
    },
  }
} as RouteDetails