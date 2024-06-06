import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/channels/:channelId/messages/:messageId",
    handler: async (req, res) => {
        return res.status(200).send(
            await actions.messages.fetch(parseInt(req.params.messageId))
        );
    },

    auth: {
        loggedIn: true,
    },

    params: {
        channelId: {
            is: "channel",
            canView: true,
        },

        messageId: {
            is: "message",
            canView: true,
            mustBeFrom: "channelId",
        }
    }
};

export default handler;