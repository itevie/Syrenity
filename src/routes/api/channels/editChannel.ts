import { RouteDetails } from "../../../types/route";
import permissionsBitfield from "../../../util/PermissionBitfield";
import config from "../../../config.json";
import { actions } from "../../../util/database";
import { send } from "../../../ws/websocketUtil";

interface EditChannelBody {
    name?: string,
    topic?: string,
}

const handler: RouteDetails<EditChannelBody> = {
    method: "PATCH",
    path: "/api/channels/:channelId",
    handler: async (req, res) => {
        const body = req.body as EditChannelBody;
        const channelId = parseInt(req.params.channelId);
        let channel = await actions.channels.fetch(channelId);

        // Check for stuff to edit
        let edited = false;
        if (body.name) {
            edited = true;
            channel = await actions.channels.setName(channelId, body.name);
        }

        if (body.topic) {
            edited = true;
            channel = await actions.channels.setTopic(channelId, body.topic);
        }

        // Check if should broadcast
        if (edited) {
            send({
                type: "ChannelUpdate",
                guildId: channel.guild_id,
                channelId,
                data: {
                    channel
                }
            });
        }

        return res.status(200).send(channel);
    },

    auth: {
        loggedIn: true,
    },

    permissions: {
        permissions: permissionsBitfield.ManageChannels,
        channelParam: "channelId"
    },

    body: {
        type: "object",
        properties: {
            name: {
                type: "string",
                nullable: true,
                minLength: config.validity.channels.name.minLength,
                maxLength: config.validity.channels.name.maxLength,
            },
            topic: {
                type: "string",
                nullable: true,
                minLength: config.validity.channels.topic.minLength,
                maxLength: config.validity.channels.topic.maxLength,
            }
        }
    },

    params: {
        channelId: {
            is: "channel"
        }
    }
};

export default handler;