import SyChannel from "../../../models/Channel";
import SyMessage from "../../../models/Message";
import { RouteDetails } from "../../../types/route";

const handler: RouteDetails = {
  path: "/testgithubwebhook",
  method: "POST",

  handler: async (req, res) => {
    console.log(req.body);
    let content = `New push on **${req.body.repository.full_name}**`;
    let channel = await SyChannel.fetch(203);
    let message = await SyMessage.create({
      channelId: channel.data.id,
      content,
      authorId: -1,
    });
    return res.status(204);
  },
};

export default handler;
