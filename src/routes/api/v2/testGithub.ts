import SyChannel from "../../../models/Channel";
import SyMessage from "../../../models/Message";
import { RouteDetails } from "../../../types/route";

const handler: RouteDetails = {
  path: "/testgithubwebhook",
  method: "POST",

  handler: async (req, res) => {
    let content = `New push on **${req.body.repository.full_name}**: ${req.body.head_commit.message} (${req.body.head_commit.url}) by **${req.body.head_commit.author.username}**`;
    await SyMessage.create({
      channelId: 203,
      content,
      authorId: -1,
      withSend: true,
      webhookId: "d5be3501-e6a4-4e0a-89e2-0beab80e7ae0",
    });
    return res.status(204);
  },
};

export default handler;
