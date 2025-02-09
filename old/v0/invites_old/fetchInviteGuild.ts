import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/invites/:inviteId/guild",

  handler: async (req, res) => {
    const inviteId = req.params.inviteId as string;
    const invite = await actions.invites.fetch(inviteId);
    const guild = await actions.guilds.fetch(invite.guild_id);

    return res.status(200).send(guild);
  },

  auth: {
    loggedIn: true,
  },

  params: {
    inviteId: {
      is: "invite",
      canView: null,
    },
  },
};

export default handler;
