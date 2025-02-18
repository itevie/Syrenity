import database from "../../../../database/database";
import SyUser from "../../../../models/User";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/users/:id",
  handler: async (req, res, next) => {
    try {
      return res
        .status(200)
        .send((await SyUser.fetch(parseInt(req.params.id))).data);
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
      canView: true,
    },
  },
};

export default handler;
