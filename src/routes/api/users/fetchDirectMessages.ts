import * as database from '../../../database';
import { RouteDetails } from "../../../types/route";

export default {
  method: "GET",
  path: "/api/users/:userId/channels",
  handler: async (req, res) => {
    // Fetch relationships
    const relationships = await database.actions.relationships.fetchList((req.user as User).id);

    return res.status(200).send({
      relationships,
    });
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      userId: {
        is: 'user',
        mustBeSelf: true,
      }
    }
  }
} as RouteDetails