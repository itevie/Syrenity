import SyChannel from "../../../../models/Channel";
import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";

const handler: RouteDetails = {
  method: "GET",
  path: "/channels/:channel",
  handler: async (req, res) => {
    return res
      .status(200)
      .send((await SyChannel.fetch(parseInt(req.params.channel))).data);
  },

  auth: {
    loggedIn: true,
  },

  params: {
    channel: {
      is: "channel",
      canView: true,
    },
  },
};

export default handler;
