import database from "../../../database/database";
import { RouteDetails } from "../../../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/users/:id/servers",
  handler: async (req, res, next) => {
    try {
      const servers = await database.users.getServers(parseInt(req.params.id));
      return res.status(200).send(servers);
    } catch (e) {
      next(e);
    }
  },

  auth: {
    loggedIn: true,
  },

  params: {
    id: {
      is: "user",
      mustBeSelf: true,
    },
  },
};

export default handler;
