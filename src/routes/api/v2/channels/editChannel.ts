import config from "../../../../config";
import SyrenityError from "../../../../errors/BaseError";
import SyChannel, { UpdateChannelOptions } from "../../../../models/Channel";
import SyServer from "../../../../models/Servers";
import { RouteDetails } from "../../../../types/route";
import permissionsBitfield from "../../../../util/PermissionBitfield";

const route: RouteDetails<UpdateChannelOptions> = {
  method: "PATCH",
  path: "/channels/:channel",

  handler: async (req, res) => {
    const body = req.body as UpdateChannelOptions;
    let channel = await SyChannel.fetch(parseInt(req.params.channel));

    if (channel.data.type === "dm")
      return res.status(400).send(
        new SyrenityError({
          message: "Cannot edit a DM channel",
          errorCode: "CannotEditDMChannel",
          statusCode: 400,
        })
      );

    const { position, ...rest } = body;
    if (position) {
      if (position <= 0)
        return res.status(400).send(
          new SyrenityError({
            message: "Channel position must be greater than 0",
            errorCode: "InvalidBody",
            statusCode: 400,
          })
        );
      await channel.setPosition(position);
    }

    if (Object.values(rest).length !== 0) {
      channel = await channel.edit(rest);
    }

    return res.status(200).send(channel.data);
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

  permissions: {
    permissions: permissionsBitfield.ManageChannels,
    channelParam: "channel",
  },

  body: {
    type: "object",
    properties: {
      name: {
        type: "string",
        ...config.validity.channels.name,
        nullable: true,
      },
      topic: {
        type: "string",
        nullable: true,
      },
      position: {
        type: "number",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
};

export default route;
