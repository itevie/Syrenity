import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "GET",
  path: "/api/users/:id/account-token",
  handler: async (req, res) => {
    // Get the details
    const userId = parseInt(req.params.id);

    // Check if the user already has a token
    if (await database.actions.applications.userIdHasToken(userId)) {
      return res.status(401).send({
        message: "The user already has a token"
      });
    }
  },
  details: {
    auth: {
      allowBots: false,
      loggedIn: true,
    },
    params: {
      id: {
        is: "user",
        mustBeSelf: true,
      }
    },
  }
} as RouteDetails