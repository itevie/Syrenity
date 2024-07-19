import AuthenticationError from "../../../../errors/AuthenticationError";
import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";
import config from "../../../../config.json";
import { MessageUpdateOptions } from "../../../../util/dbactions/messages";
import { send } from "../../../../ws/websocketUtil";
import permissionsBitfield from "../../../../util/PermissionBitfield";

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

        await actions.messages.setPinStatus(messageId, true);
        message = await actions.messages.fetch(messageId);

        send({
            type: "MessageEdit",
            guildId: channel.guild_id,
            channelId: channel.id,
            data: {
                message: message,
            }
        })

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