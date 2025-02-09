import { RouteDetails } from "../../../../../types/route";
import { actions } from "../../../../../util/database";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/guilds/:guildId/roles/:roleId",

  handler: async (req, res) => {
    let roleId = parseInt(req.params["roleId"]);

    return res.status(200).send(await actions.roles.fetch(roleId));
  },

  auth: {
    loggedIn: true,
  },

  params: {
    guildId: {
      is: "guild",
    },

    roleId: {
      is: "role",
    },
  },
};

export default handler;
