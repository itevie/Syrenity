import { RouteDetails } from "../../../../../types/route";
import { actions } from "../../../../../util/database";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/guilds/:guildId/members",
  handler: async (req, res) => {
    return res.status(200).send({
      members: await actions.members.fetchList(parseInt(req.params.guildId)),
    });
  },

  auth: {
    loggedIn: true,
  },

  params: {
    guildId: {
      is: "guild",
      canView: true,
    },
  },
};

export default handler;
