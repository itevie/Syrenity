import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/guilds/:guildId",
    handler: async (req, res) => {
        return res.status(200).send(
            await actions.guilds.fetch(parseInt(req.params.guildId))
        );
    },

    auth: {
        loggedIn: true,
    },

    params: {
        guildId: {
            is: "guild",
            canView: true,
        }
    }
};

export default handler;