import * as database from '../../../database';
import { RouteDetails } from "../../../types/route";

export default {
  method: "POST",
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

    // Check if the user is alrady in the guild
    if (await database.actions.guilds.members.has(invite.guild_id, (req.user as User).id))
      return res.status(400).send({
        message: `You are already in this guild`,
        at: `param.inviteId`
      });
    
    // Add user
    await database.actions.guilds.members.add(invite.guild_id, (req.user as User).id);

    return res.status(200).send({
      message: `Joined guild`
    });
  },
  details: {
    auth: {
      loggedIn: true,
    },
  }
} as RouteDetails