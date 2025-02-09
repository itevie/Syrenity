import { RouteDetails } from "../../../../../types/route";
import { actions } from "../../../../../util/database";
import config from "../../../../../config.json";
import { send } from "../../../../../ws/websocketUtil";
import permissionsBitfield from "../../../../../util/PermissionBitfield";

interface CreateMessageBody {
  content: string;
}

const handler: RouteDetails<CreateMessageBody> = {
  method: "POST",
  path: "/channels/:channel/messages",
  handler: async (req, res) => {
    const body = req.body as CreateMessageBody;
    const channel = parseInt(req.params.channel);

    // Create the message
    const message = await actions.messages.create({
      channelId: channel,
      authorId: (req.user as User).id,
      content: body.content,
    });

    // Broadcast event
    send({
      guild: (await actions.channels.fetch(channel)).guild_id,
      channel,
      type: "MessageCreate",
      payload: {
        message,
      },
    });

    return res.status(200).send(message);
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.CreateMessages,
    channelParam: "channel",
  },

  body: {
    type: "object",
    properties: {
      content: {
        type: "string",
        minLength: config.validity.messages.minLength,
        maxLength: config.validity.messages.maxLength,
      },
    },
    required: ["content"],
    errorMessage: {
      properties: {
        content: "Content is invalid",
      },
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
