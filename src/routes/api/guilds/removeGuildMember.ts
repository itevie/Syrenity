import * as database from '../../../database';
import { RouteDetails } from "../../../types/route";

export default {
  method: "DELETE",
  path: "/api/guilds/:guildId/members/:memberId",
  handler: async (req, res) => {
    // Obtain details
    const guildId = parseInt(req.params.guildId);
    const userId = parseInt(req.params.memberId);

    // Check if the user is even a member
    if ((await database.actions.guilds.members.has(guildId, userId)) === false)
      return res.status(400).send({
        message: `You are not apart of this guild`,
        at: `params.guildId`
      });

    // Check if it is the owner
    const guild = await database.actions.guilds.fetch(guildId);

    if (guild.owner_id === userId)
      return res.status(400).send({
        message: `You cannot leave the server as you own the server`,
        at: `params.guildId`
      });
    
    // Remove the member
    await database.actions.guilds.members.remove(guildId, userId);

    // Done
    return res.status(200).send({
      message: `Removed from the guild`
    });
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      guildId: {
        is: 'guild',
        canView: true
      },
      memberId: {
        is: "user",
      }
    }
  }
} as RouteDetails