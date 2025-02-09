import { RouteDetails } from "../../../../../types/route";
import { actions } from "../../../../../util/database";
import permissionsBitfield from "../../../../../util/PermissionBitfield";

const handler: RouteDetails = {
  method: "DELETE",
  path: "/api/guilds/:guildId/invites/:inviteId",

  handler: async (req, res) => {
    const inviteId = req.params.inviteId as string;
    await actions.invites.delete(inviteId);

    return res.status(204);
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    guildParam: "guildId",
    permissions: permissionsBitfield.ManageInvites,
  },

  params: {
    guildId: {
      is: "guild",
    },

    inviteId: {
      is: "invite",
      canView: null,
    },
  },
};

export default handler;
