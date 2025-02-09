import database from "../../../../database/database";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/users/:user/servers",
  handler: async (req, res, next) => {
    try {
      const servers = await database.users.getServers(
        parseInt(req.params.user)
      );
      return res.status(200).send(servers);
    } catch (e) {
      next(e);
    }
  },

  auth: {
    loggedIn: true,
  },

  params: {
    user: {
      is: "user",
      mustBeSelf: true,
    },
  },
};

export default handler;
