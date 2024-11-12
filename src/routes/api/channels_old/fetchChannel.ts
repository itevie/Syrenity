import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/channels/:channelId",
    handler: async (req, res) => {
        return res.status(200).send(
            await actions.channels.fetch(parseInt(req.params.channelId))
        );
    },

    auth: {
        loggedIn: true,
    },

    params: {
        channelId: {
            is: "channel",
            canView: true,
        }
    }
};

export default handler;