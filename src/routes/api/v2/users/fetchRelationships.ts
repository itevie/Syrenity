import SyUser from "../../../../models/User";
import { RouteDetails } from "../../../../types/route";

const route: RouteDetails = {
  method: "GET",
  path: "/users/:user/relationships",

  handler: async (req, res) => {
    const user = await SyUser.fetch(parseInt(req.params.user));
    return res.status(200).send(await user.fetchExpandedRelationships());
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

export default route;
