import { RouteDetails } from "../../../types/route";
import * as database from "../../../util/database";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/users/:id/guilds",
    handler: async (req, res) => {
        const guilds = await database.actions.users.fetchGuilds(
            parseInt(req.params.id)
        );
        
        return res.status(200).send({
            guilds
        });
    },

    auth: {
        loggedIn: true,
    },

    params: {
        id: {
            is: "user",
            mustBeSelf: true,
        }
    }
};

export default handler;