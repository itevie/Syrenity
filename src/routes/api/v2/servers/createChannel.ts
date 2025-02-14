import config from "../../../../config";
import SyChannel, { CreateChannelOptions } from "../../../../models/Channel";
import SyServer from "../../../../models/Servers";
import { RouteDetails } from "../../../../types/route";
import permissionsBitfield from "../../../../util/PermissionBitfield";

const route: RouteDetails<CreateChannelOptions> = {
  method: "POST",
  path: "/servers/:server/channels",

  handler: async (req, res) => {
    const server = await SyServer.fetch(parseInt(req.params.server));
    const body = req.body as CreateChannelOptions;
    const channel = await SyChannel.createServerChannel(server.data.id, body);
    return res.status(200).send(channel.data);
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.ManageChannels,
    guildParam: "server",
  },

  body: {
    type: "object",
    properties: {
      name: {
        type: "string",
        ...config.validity.channels.name,
      },
    },
    additionalProperties: false,
    required: ["name"],
  },
};

export default route;
