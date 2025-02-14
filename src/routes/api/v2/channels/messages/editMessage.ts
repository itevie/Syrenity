import config from "../../../../../config";
import SyrenityError from "../../../../../errors/BaseError";
import SyMessage, { EditMessageOptions } from "../../../../../models/Message";
import { RouteDetails } from "../../../../../types/route";
import { send } from "../../../../../ws/websocketUtil";

interface EditMessagesBody {
  content: string;
}

const route: RouteDetails<EditMessagesBody> = {
  method: "PATCH",
  path: "/channels/:channel/messages/:message",

  auth: {
    loggedIn: true,
  },

  handler: async (req, res) => {
    let message = await SyMessage.fetch(parseInt(req.params.message));
    if (message.data.author_id !== (req.user as User).id) {
      return res.status(401).send(
        new SyrenityError({
          message: "You can only edit your own messages",
          statusCode: 401,
          errorCode: "MissingPermissions",
        })
      );
    }

    message = await message.edit(req.body as EditMessageOptions);
    const expanded = await message.expand();

    send({
      guild: (await message.fetchChannel()).data.guild_id,
      channel: message.data.channel_id,
      type: "MessageUpdate",
      payload: {
        message: expanded,
      },
    });

    return res.status(200).send(expanded);
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
    },
    message: {
      is: "message",
    },
  },
};

export default route;
