import { RouteDetails } from "../../../../types/route";
import permissionsBitfield from "../../../../util/PermissionBitfield";

const route: RouteDetails = {
  method: "DELETE",
  path: "/servers/:server/members/:user",

  handler: async (req, res) => {},

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.KickMembers,
    guildParam: "server",
  },
};

export default route;
