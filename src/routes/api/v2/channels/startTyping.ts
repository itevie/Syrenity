import SyChannel from "../../../../models/Channel";
import { RouteDetails } from "../../../../types/route";

const route: RouteDetails = {
  path: "/channels/:channel/start-typing",
  method: "POST",

  handler: async (req, res) => {
    const channel = await SyChannel.fetch(parseInt(req.params.channel));
    await channel.startTyping((req.user as FullUser).id);

    return res.status(200).send({
      message: "Start Typing",
    });
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

export default route;
