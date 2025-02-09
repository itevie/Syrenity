import database from "../../../../../database/database";
import { RouteDetails } from "../../../../../types/route";
import permissionsBitfield from "../../../../../util/PermissionBitfield";

const route: RouteDetails = {
  method: "DELETE",
  path: "/channels/:channel/messages/:message",

  auth: {
    loggedIn: true,
  },

  handler: async (req, res) => {
    const messageId = parseInt(req.params.message);
    await database.messages.delete(messageId);

    send({
      guild: await database.servers.get(messageId),
    });

    return res.status(200).send({
      message: "Message deleted",
    });
  },

  permissions: {
    permissions: permissionsBitfield.ManageMessages,
    channelParam: "channel",
  },

  params: {
    channel: {
      is: "channel",
    },
    message: {
      is: "message",
    },
  },
};

export default route;
