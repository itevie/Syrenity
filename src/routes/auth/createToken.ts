import database from "../../database/database";
import SyToken from "../../models/Token";
import { RouteDetails } from "../../types/route";

const handler: RouteDetails = {
  path: "/auth/get-token",
  method: "POST",

  handler: async (req, res, next) => {
    try {
      const token = await SyToken.createFor(
        (req.user as User).id,
        "auth-get-token",
      );

      return res.status(200).send(token);
    } catch (e) {
      return next(e);
    }
  },

  auth: {
    loggedIn: true,
  },
};

export default handler;
