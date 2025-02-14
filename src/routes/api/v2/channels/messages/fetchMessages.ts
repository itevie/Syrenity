import SyMessage, { ExpandedMessage } from "../../../../../models/Message";
import { RouteDetails } from "../../../../../types/route";
import { actions } from "../../../../../util/database";
import permissionsBitfield from "../../../../../util/PermissionBitfield";
import { fuckYouJs } from "../../../../../util/util";

const handler: RouteDetails = {
  method: "GET",
  path: "/channels/:channel/messages",
  handler: async (req, res) => {
    const messages = (
      await actions.channels.fetchMessages(parseInt(req.params.channel), {
        amount: fuckYouJs(req.query.amount as string),
        startAtId: fuckYouJs(req.query.start_at as string),
        fromAuthor: fuckYouJs(req.query.from_user as string),
        isPinned: "pinned" in req.query ? req.query.pinned === "true" : null,
      })
    ).map((x) => new SyMessage(x));
    const newMessages: ExpandedMessage[] = [];
    for await (const message of messages) {
      newMessages.push(await message.expand());
    }
    return res.status(200).send(newMessages);
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.ReadChannelHistory,
    channelParam: "channel",
  },

  query: {
    amount: {
      type: "number",
      optional: true,
      defaultValue: "20",
      options: ["positiveNumber"],
    },

    start_at: {
      type: "number",
      optional: true,
      options: ["positiveNumber"],
    },

    pinned: {
      type: "boolean",
      optional: true,
    },

    from_user: {
      type: "number",
      optional: true,
      options: ["positiveNumber"],
    },
  },

  params: {
    channel: {
      is: "channel",
      canView: true,
    },
  },
};

export default handler;
