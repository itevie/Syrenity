import BaseError from "../../../errors/BaseError";
import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";
import { send } from "../../../ws/websocketUtil";

interface UpdateUserBody {
    avatar?: string,
}

const handler: RouteDetails<UpdateUserBody> = {
    method: "PATCH",
    path: "/api/users/:userId",
    handler: async (req, res) => {
        let body = req.body as UpdateUserBody;

        if (body.avatar) {
            // Validate
            if (!body.avatar.startsWith("syrenity-file://"))
                return res.status(400).send(new BaseError({ message: "Expected a syrenity file", errorCode: "MustBeSyrenityFileUrl" }).extract());
            // TODO: Validate the given url that it is valid.
            await actions.users.setAvatar((req.user as User).id, body.avatar);
        }

        let newUser = await actions.users.fetch((req.user as User).id);

        send({
            type: "UserUpdate",
            data: {
                user: newUser
            }
        });

        return res.status(200).send(newUser);
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