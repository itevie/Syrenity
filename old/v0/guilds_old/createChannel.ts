import { RouteDetails } from "../../../../types/route";
import permissionsBitfield from "../../../../util/PermissionBitfield";
import config from "../../../../config.json";
import { actions } from "../../../../util/database";
import { send } from "../../../../ws/websocketUtil";

interface CreateChannelBody {
  name: string;
}

const handler: RouteDetails<CreateChannelBody> = {
  method: "POST",
  path: "/api/guilds/:guildId/channels",
  handler: async (req, res) => {
    const body = req.body as CreateChannelBody;
    const guildId = parseInt(req.params.guildId);

    const channel = await actions.guilds.createChannel(guildId, body.name);

    send({
      type: "ChannelCreate",
      guildId: channel.guild_id,
      channelId: channel.id,
      data: {
        channel,
      },
    });

    return res.status(200).send(channel);
  },

  auth: {
    loggedIn: true,
  },

  body: {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: config.validity.channels.name.minLength,
        maxLength: config.validity.channels.name.maxLength,
      },
    },
    required: ["name"],
  },

  permissions: {
    permissions: permissionsBitfield.ManageChannels,
    guildParam: "guildId",
  },

  params: {
    guildId: {
      is: "guild",
    },
  },
};

export default handler;
