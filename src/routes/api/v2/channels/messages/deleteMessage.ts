import database from "../../../../../database/database";
import SyMessage from "../../../../../models/Message";
import { RouteDetails } from "../../../../../types/route";
import permissionsBitfield from "../../../../../util/PermissionBitfield";
import { send } from "../../../../../ws/websocketUtil";

const route: RouteDetails = {
  method: "DELETE",
  path: "/channels/:channel/messages/:message",

  auth: {
    loggedIn: true,
  },

  handler: async (req, res) => {
    const message = await SyMessage.fetch(parseInt(req.params.message));
    await message.delete();

    send({
      guild: (await message.fetchChannel()).data.guild_id,
      channel: message.data.channel_id,
      type: "MessageDelete",
      payload: {
        message_id: message.data.id,
      },
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
