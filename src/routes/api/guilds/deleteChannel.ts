import { RouteDetails } from "../../../types/route";
import permissionsBitfield from "../../../util/PermissionBitfield";
import config from "../../../config.json";
import { actions } from "../../../util/database";
import { send } from "../../../ws/websocketUtil";

interface CreateChannelBody {
    name: string,
}

const handler: RouteDetails<CreateChannelBody> = {
    method: "DELETE",
    path: "/api/guilds/:guildId/channels/:channelId",
    handler: async (req, res) => {
        const guildId = parseInt(req.params.guildId);
        const channelId = parseInt(req.params.channelId);

        await actions.guilds.deleteChannel(channelId);

        send({
            type: "ChannelDelete",
            guildId: guildId,
            channelId: channelId,
            data: {
                channelId,
                guildId,
            }
        });

        return res.status(200).send({ message: "Deleted" });
    },

    auth: {
        loggedIn: true,
    },

    permissions: {
        permissions: permissionsBitfield.ManageChannels,
        guildParam: "guildId"
    },

    params: {
        guildId: {
            is: "guild"
        },

        channelId: {
            is: "channel"
        }
    }
};

export default handler;