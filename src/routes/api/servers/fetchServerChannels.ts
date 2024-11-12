import database from "../../../database/database";
import { RouteDetails } from "../../../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/servers/:id/channels",
  handler: async (req, res, next) => {
    try {
      return res
        .status(200)
        .send(await database.servers.getChannels(parseInt(req.params.id)));
    } catch (e) {
      next(e);
    }
  },

  auth: {
    loggedIn: true,
  },

  params: {
    id: {
      is: "guild",
    },
  },
};

export default handler;
