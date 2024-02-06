import * as database from '../../../database';
import { RouteDetails } from "../../../types/route";

export default {
  method: "GET",
  path: "/api/invites/:inviteId",
  handler: async (req, res) => {
    // Obtain details
    const inviteCode = req.params.inviteId as string;

    // Check if the invite exists
    if ((await database.actions.invites.exists(inviteCode)) === false)
      return res.status(404).send({
        message: `The invite code ${inviteCode} does not exist`,
        at: `param.inviteId`
      });

    // Fetch the invite
    const invite = await database.actions.invites.fetch(inviteCode);

    return res.status(200).send(invite);
  },
  details: {
    auth: {
      loggedIn: true,
    },
  }
} as RouteDetails
