import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "GET",
  path: "/api/users/:userId/applications",
  handler: async (req, res) => {
    const users = await database.actions.applications.fetchUserApplications((req.user as User).id);

    return res.status(200).send({
      users,
    });
  },
  details: {
    auth: {
      loggedIn: true,
    },
  }
} as RouteDetails