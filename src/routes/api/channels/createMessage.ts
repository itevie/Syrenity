import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";
import config from "../../../config.json";
import { send } from "../../../ws/websocketUtil";

interface CreateMessageBody {
    content: string,
}

const handler: RouteDetails<CreateMessageBody> = {
    method: "POST",
    path: "/api/channels/:channelId/messages",
    handler: async (req, res) => {
        const body = req.body as CreateMessageBody;
        const channelId = parseInt(req.params.channelId);

        // Create the message
        const message = await actions.channels.createMessage({
            channelId: channelId,
            authorId: (req.user as User).id,
            content: body.content,
        });

        // Broadcast event
        send({
            guildId: (await actions.channels.fetch(channelId)).guild_id,
            channelId,
            type: "MESSAGE_CREATE",
            data: {
                message,
            }
        });

        return res.status(200).send(message);
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
            }
        },
        required: ["content"],
        errorMessage: {
            properties: {
                content: "Content is invalid"
            }
        }
    },

    params: {
        channelId: {
            is: "channel",
            canView: true,
        },
    }
};

export default handler;