import BaseError from "../../../errors/BaseError";
import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";
import { send } from "../../../ws/websocketUtil";

const handler: RouteDetails = {
    method: "GET",
    path: "/api/invites/:inviteId",

    handler: async (req, res) => {
        const inviteId = req.params.inviteId as string;
        const invite = await actions.invites.fetch(inviteId);

        return res.status(200).send(invite);
    },

    auth: {
        loggedIn: true,
    },

    params: {
        inviteId: {
            is: "invite",
            canView: null,
        }
    }
};

export default handler;