import SyrenityError from "../../../../errors/BaseError";
import SyMessage from "../../../../models/Message";
import { RouteDetails } from "../../../../types/route";
import permissionsBitfield from "../../../../util/PermissionBitfield";

const route: RouteDetails = {
  method: "POST",
  path: "/channels/:channel/pins/:message",

  handler: async (req, res) => {
    const message = await SyMessage.fetch(parseInt(req.params.message));
    if (message.data.is_pinned)
      return res.status(400).send(
        new SyrenityError({
          message: "The message is already pinned",
          errorCode: "Conflict",
          statusCode: 400,
        }).extract()
      );

    return res.status(200).send(await message.setPinned(true));
  },

  auth: {
    loggedIn: true,
  },

  params: {
    channel: {
      is: "channel",
    },
    message: {
      is: "message",
    },
  },

  permissions: {
    permissions: permissionsBitfield.ManageMessages,
    channelParam: "channel",
  },
};

export default route;
