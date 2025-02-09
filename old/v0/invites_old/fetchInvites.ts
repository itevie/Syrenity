import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";
import permissionsBitfield from "../../../../util/PermissionBitfield";

let handler: RouteDetails = {
  method: "GET",
  path: "/api/guilds/:guildId/invites",

  handler: async (req, res) => {
    let guildId = parseInt(req.params["guildId"] as string);
    let invites = await actions.invites.fetchAll(guildId);

    return res.status(200).send({
      invites,
    });
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.ManageInvites,
    guildParam: "guildId",
  },

  params: {
    guildId: {
      is: "guild",
      canView: true,
    },
  },
};

export default handler;
