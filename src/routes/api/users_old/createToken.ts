import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";
import { generateToken } from "../../../util/util";

const handler: RouteDetails = {
    method: "POST",
    path: "/api/users/:userId/tokens",

    handler: async (req, res) => {
        let tokenText = generateToken((req.user as User).id);
        let token = await actions.tokens.createToken(tokenText, (req.user as User).id, req.headers["user-agent"]);

        return res.status(200).send(token);
    },

    auth: {
        loggedIn: true,
        sessionOnly: true,
    }
}

export default handler;