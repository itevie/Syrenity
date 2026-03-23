import FriendRequest from "../../../../models/FriendRequest";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  path: "/users/:user/friend_requests/:recipient",
  method: "POST",

  handler: async (req, res) => {
    await FriendRequest.create(
      parseInt(req.params.user),
      parseInt(req.params.recipient),
    );

    return res.status(204).send();
  },

  auth: {
    loggedIn: true,
  },

  params: {
    user: {
      is: "user",
      mustBeSelf: true,
    },

    recipient: {
      is: "user",
    },
  },
};

export default handler;
