import SyChannel from "../../../models/Channel";
import SyMessage from "../../../models/Message";
import { RouteDetails } from "../../../types/route";

const handler: RouteDetails = {
  path: "/testgithubwebhook",
  method: "POST",

  handler: async (req, res) => {
    const payload = req.body;

    const repoName = payload.repository.full_name;

    console.log(payload);
    let content: string | null = null;

    if (payload.pusher && payload.repository) {
      content = `New push on **${repoName}**: ${payload.head_commit.message} (${payload.head_commit.url}) by **${payload.head_commit.author.username}**`;
    } else if (payload.issue) {
      const issue = payload.issue;
      content = `New issue **${payload.action}** in **${repoName}**: **${issue.title}** (${issue.url})\n\nBody: ${issue.body}\nCreated By: **${issue.user.login}**`;
    }

    console.log(content);

    if (content)
      await SyMessage.create({
        channelId: 206,
        content,
        authorId: -1,
        withSend: true,
        webhookId: "d5be3501-e6a4-4e0a-89e2-0beab80e7ae0",
      });

    return res.status(204).send();
  },
};

export default handler;
