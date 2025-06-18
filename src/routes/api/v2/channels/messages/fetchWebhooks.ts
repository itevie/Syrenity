import SyWebhook from "../../../../../models/Webhook";
import { RouteDetails } from "../../../../../types/route";
import { expandMany } from "../../../../../util/database";

const route: RouteDetails = {
  path: "/channels/:channel/webhooks",
  method: "GET",

  handler: async (req, res) => {
    return res
      .status(200)
      .send(
        await expandMany(
          await SyWebhook.getForChannel(parseInt(req.params.channel)),
        ),
      );
  },

  auth: {
    loggedIn: true,
  },

  params: {
    channel: {
      is: "channel",
    },
  },
};

export default route;
