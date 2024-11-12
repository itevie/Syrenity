import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/guilds/:guildId/members/:memberId",
    handler: async (req, res) => {
        return res.status(200).send(
            await actions.members.fetch(parseInt(req.params.memberId), parseInt(req.params.guildId))
        );
    },

    auth: {
        loggedIn: true,
    },

    params: {
        guildId: {
            is: "guild",
            canView: true,
        },
        memberId: {
            is: "user"
        }
    }
};

export default handler;