import database from "../../database/database";
import SyToken from "../../models/Token";
import SyUser from "../../models/User";
import { RouteDetails } from "../../types/route";

interface GetTokenBody {
  email: string;
  password: string;
}

const handler: RouteDetails = {
  path: "/auth/get-token",
  method: "POST",

  handler: async (req, res, next) => {
    try {
      const token = await SyToken.createFor(
        (req.user as SyUser).data.id,
        "auth-get-token"
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
