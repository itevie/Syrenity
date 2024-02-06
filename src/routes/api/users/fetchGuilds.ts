import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "GET",
  path: "/api/users/:id/guilds",
  handler: async (req, res) => {
    // Get the details
    const userId = parseInt(req.params.id);

    // Fetch user guilds
    const guilds = await database.actions.users.fetchGuilds(userId);

    return res.status(200).send({
      guilds
    });
  },
  details: {
    params: {
      id: {
        is: "user",
        mustBeSelf: true,
      }
    },
  }
} as RouteDetails