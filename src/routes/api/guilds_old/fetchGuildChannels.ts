import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/guilds/:id/channels",
    handler: async (req, res) => {
        const channels = await actions.guilds.fetechChannelList(parseInt(req.params.id));
        
        return res.status(200).send({
            channels,
        });
    },

    auth: {
        loggedIn: true,
    },

    params: {
        id: {
            is: "guild",
            canView: true,
        }
    }
};

export default handler;