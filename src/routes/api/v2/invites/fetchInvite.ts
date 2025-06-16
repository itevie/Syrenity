import SyInvite from "../../../../models/Invite";
import { RouteDetails } from "../../../../types/route";

const route: RouteDetails = {
  method: "GET",
  path: "/invites/:invite",

  handler: async (req, res) => {
    return res
      .status(200)
      .send(await (await SyInvite.fetch(req.params.invite)).expand());
  },

  auth: {
    loggedIn: false,
  },

  params: {
    invite: {
      is: "invite",
      canView: null,
    },
  },
};

export default route;
