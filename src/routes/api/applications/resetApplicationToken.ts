import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';

export default {
  method: "PATCH",
  path: "/api/applications/:userId/token",
  handler: async (req, res) => {
    // Fetch the user
    const user = await database.actions.users.fetch(parseInt(req.params.userId));
    const application = await database.actions.applications.fetchByUserId(user.id);

    // Check if the user owns it
    if ((req.user as User).id !== application.owner_id) {
      return res.status(401).send({
        message: "You do not own this application"
      });
    }

    // Reset token
    const token = await database.actions.applications.resetToken(application.id, user.id);

    return res.status(200).send({
      token,
    });
  },
  details: {
    auth: {
      loggedIn: true,
    },
  }
} as RouteDetails