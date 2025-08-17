import SyChannel from "../../../models/Channel";
import SyMessage from "../../../models/Message";
import { RouteDetails } from "../../../types/route";

const handler: RouteDetails = {
  path: "/testgithubwebhook",
  method: "POST",

  handler: async (req, res) => {
    const payload = req.body;

    console.log(payload);
    let content: string | null = null;

    if (payload.pusher && payload.repository) {
      content = `New push on **${payload.repository.full_name}**: ${payload.head_commit.message} (${payload.head_commit.url}) by **${payload.head_commit.author.username}**`;
    } else if (payload.issue) {
      const issueTitle: string = payload.issue.title;
      const issueBody: string | null = payload.issue.body;
      const repoName: string = payload.repository.name;
      const userLogin: string = payload.issue.user.login;

      content = `New issue created in **${repoName}**: **${issueTitle}**\n\nBody: ${issueBody}\nCreated by: **${userLogin}**`;
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
