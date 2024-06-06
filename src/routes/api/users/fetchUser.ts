import { RouteDetails } from "../../../types/route";
import * as database from "../../../util/database";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/users/:id",
    handler: async (req, res) => {
        const user = await database.actions.users.fetch(
            parseInt(req.params.id)
        );
        
        return res.status(200).send(user);
    },
    
    auth: {
        loggedIn: true,
    },

    params: {
        id: {
            is: "user",
            canView: true,
        }
    }
};

export default handler;