import FriendRequest from "../../../../models/FriendRequest";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  path: "/users/:user/friend_requests",
  method: "GET",

  handler: async (req, res) => {
    return res
      .status(200)
      .send(await FriendRequest.fetchAllFor(parseInt(req.params.user)));
  },

  auth: {
    loggedIn: true,
  },

  params: {
    user: {
      is: "user",
      mustBeSelf: true,
    },
  },
};

export default handler;
