import AuthenticationError from "../../../../errors/AuthenticationError";
import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";
import config from "../../../../config.json";
import { MessageUpdateOptions } from "../../../../util/dbactions/messages";
import { send } from "../../../../ws/websocketUtil";

interface EditMessageBody {
    content?: string,
}

const handler: RouteDetails<EditMessageBody> = {
    method: "PATCH",
    path: "/api/channels/:channelId/messages/:messageId",
    handler: async (req, res) => {
        const messageId = parseInt(req.params.messageId);
        const user = (req.user) as User;
        const message = await actions.messages.fetch(messageId);
        const channel = await actions.channels.fetch(message.channel_id);
        const body = req.body as EditMessageBody;

        // Check if is the author
        if (message.author_id !== user.id) {
            return res.status(401).send(new AuthenticationError({
                message: `You are not the author of this message`,
                errorCode: "NotAuthor"
            }).extract());
        }

        // Compute what to update
        const updateOptions: MessageUpdateOptions = {};

        if (body.content) {
            updateOptions.content = body.content;
        }

        // Check if there is anything to update
        if (Object.keys(updateOptions).length === 0)
            return res.status(200).send(message);

        const newMessage = await actions.messages.editMessage(messageId, updateOptions);

        // Send websocket event
        send({
            type: "MessageEdit",
            channelId: message.channel_id,
            guildId: channel.guild_id,
            data: {
                message: newMessage
            }
        });

        return res.status(200).send(newMessage);
    },

    auth: {
        loggedIn: true,
    },

    body: {
        type: "object",
        properties: {
            content: {
                type: "string",
                minLength: config.validity.messages.minLength,
                maxLength: config.validity.messages.maxLength,
                nullable: true,
            }
        },
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