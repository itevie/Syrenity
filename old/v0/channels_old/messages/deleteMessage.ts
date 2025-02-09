import AuthenticationError from "../../../../../errors/AuthenticationError";
import { RouteDetails } from "../../../../../types/route";
import { actions } from "../../../../../util/database";
import permissionsBitfield from "../../../../../util/PermissionBitfield";
import {
  bitfieldToStringArray,
  hasPermission,
} from "../../../../../util/permissionChecker";
import { send } from "../../../../../ws/websocketUtil";

const handler: RouteDetails = {
  method: "DELETE",
  path: "/api/channels/:channelId/messages/:messageId",
  handler: async (req, res) => {
    const channelId = parseInt(req.params.channelId);
    const messageId = parseInt(req.params.messageId);
    const user = req.user as User;

    const message = await actions.messages.fetch(messageId);
    const channel = await actions.channels.fetch(channelId);
    const guild =
      channel.guild_id !== null
        ? await actions.guilds.fetch(channel.guild_id)
        : null;

    // Check if author
    if (message.author_id !== user.id) {
      // Check if has manage messages
      const gotPermission = await hasPermission({
        guild: guild as Server,
        channel,
        user,
        permission: permissionsBitfield.ManageMessages,
      });

      if (!gotPermission) {
        return res.status(401).send(
          new AuthenticationError({
            message: `You do not have permission to delete this message`,
            errorCode: "MissingPermissions",
            data: {
              bitfield: permissionsBitfield.ManageMessages,
              bitfieldString: bitfieldToStringArray(
                permissionsBitfield.ManageMessages
              ),
            },
          }).extract()
        );
      }
    }

    // Delete message
    await actions.messages.delete(messageId);

    // Broadcast
    send({
      channelId,
      guildId: guild?.id,
      type: "MessageDelete",
      data: {
        messageId,
        channelId,
      },
    });

    return res.status(204);
  },

  auth: {
    loggedIn: true,
  },

  params: {
    channelId: {
      is: "channel",
    },

    messageId: {
      is: "message",
    },
  },
};

export default handler;
