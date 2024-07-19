import { RouteDetails } from "../../../types/route";

interface UpdateUserBody {
    avatar?: string,
}

const handler: RouteDetails<UpdateUserBody> = {
    method: "PATCH",
    path: "/api/users/:userId",
    handler: (req, res) => {

    },

    auth: {
        loggedIn: true,
    },

    params: {
        userId: {
            is: "user",
            mustBeSelf: true,
        }
    },

    body: {
        type: "object",
        properties: {
            avatar: {
                nullable: true,
                type: "string",
            }
        }
    }
};

export default handler;