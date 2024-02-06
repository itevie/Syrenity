import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "GET",
  path: "/api/users/:userId/relationships",
  handler: async (req, res) => {
    // Get the details
    const userId = parseInt(req.params.userId);

    const requests = await database.actions.friendRequests.fetchAll(userId);

    return res.status(200).send({
      requests,
    });
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      userId: {
        is: "user",
        mustBeSelf: true,
      },
    },
  }
} as RouteDetails