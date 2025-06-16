import SyApplication from "../../../../models/Application";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  path: "/users/:user/applications",
  method: "GET",

  handler: async (req, res) => {
    return res
      .status(200)
      .send(
        await Promise.all(
          (
            await SyApplication.fetchUsersApplications(
              parseInt(req.params.user),
            )
          ).map(async (x) => x.expand()),
        ),
      );
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
