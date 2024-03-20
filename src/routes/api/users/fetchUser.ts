import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "GET",
  path: "/api/users/:id",
  handler: async (req, res) => {
    // Get the details
    const userId = parseInt(req.params.id);

    // Fetch user
    const user = await database.actions.users.fetch(userId);
    console.log(user);

    return res.status(200).send(user);
  },
  details: {
    params: {
      id: {
        is: "user",
      }
    },
  }
} as RouteDetails