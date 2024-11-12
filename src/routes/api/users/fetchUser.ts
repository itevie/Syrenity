import database from "../../../database/database";
import { RouteDetails } from "../../../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/users/:id",
  handler: async (req, res, next) => {
    try {
      const user = await database.users.get(req.params.id);
      return res.status(200).send(user);
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
