import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";

const handler: RouteDetails = {
  method: "GET",
  path: "/channels/:channel",
  handler: async (req, res) => {
    console.log(await actions.channels.fetch(parseInt(req.params.channel)));
    return res
      .status(200)
      .send(await actions.channels.fetch(parseInt(req.params.channel)));
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
