import AuthenticationError from "../../../../errors/AuthenticationError";
import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";
import config from "../../../../config.json";
import { MessageUpdateOptions } from "../../../../util/dbactions/messages";
import { send } from "../../../../ws/websocketUtil";
import permissionsBitfield from "../../../../util/PermissionBitfield";
import { createSystemMessage } from "../../../../broadcasting/systemMessageManager";
import BaseError from "../../../../errors/BaseError";

interface EditMessageBody {
    content?: string,
}

const handler: RouteDetails<EditMessageBody> = {
    method: "PUT",
    path: "/api/channels/:channelId/pins/:messageId",
    handler: async (req, res) => {
        const messageId = parseInt(req.params.messageId);
        let message = await actions.messages.fetch(messageId);
        const channel = await actions.channels.fetch(message.channel_id);

        // Check if it is allowed to be pinned
        if (message.is_system) {
            return res.status(400).send(new BaseError({
                message: "Cannot pin a system message",
                errorCode: "InvalidBody"
            }).extract());
        }

        // Check if it is already pinned
        if (message.is_pinned) {
            return res.status(400).send(new BaseError({
                message: "That message is already pinned",
                errorCode: "InvalidBody"
            }).extract());
        }

        await actions.messages.setPinStatus(messageId, true);
        message = await actions.messages.fetch(messageId);

        // Send the message edit event
        send({
            type: "MessageEdit",
            guildId: channel.guild_id,
            channelId: channel.id,
            data: {
                message: message,
            }
        });

        // Broadcast that a message was pinned
        await createSystemMessage(
            channel.id,
            "MessagePinned",
            {
                pinned_by: (req.user as User).id,
                message_id: message.id,
            }
        );

        return res.status(200).send(message);
    },

    auth: {
        loggedIn: true,
    },

    permissions: {
        permissions: permissionsBitfield.ManageMessages,
        channelParam: "channelId"
    },

    params: {
        channelId: {
            is: "channel"
        },

        messageId: {
            is: "message",
        }
    }

};

export default handler;