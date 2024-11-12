import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";
import permissionsBitfield from "../../../../util/PermissionBitfield";
import { fuckYouJs } from "../../../../util/util";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/channels/:channelId/messages",
  handler: async (req, res) => {
    return res.status(200).send(
      await actions.channels.fetchMessages(parseInt(req.params.channelId), {
        amount: fuckYouJs(req.query.amount as string),
        startAtId: fuckYouJs(req.query.start_at as string),
        fromAuthor: fuckYouJs(req.query.from_user as string),
        isPinned: "pinned" in req.query ? req.query.pinned === "true" : null,
      })
    );
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.ReadChannelHistory,
    channelParam: "channelId",
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
    channelId: {
      is: "channel",
      canView: true,
    },
  },
};

export default handler;
