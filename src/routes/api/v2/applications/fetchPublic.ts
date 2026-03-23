import SyApplication from "../../../../models/Application";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  path: "/public-applications",
  method: "GET",

  handler: async (req, res) => {
    return res
      .status(200)
      .send(
        await Promise.all(
          (await SyApplication.fetchPublic()).map(async (x) => x.expand())
        )
      );
  },

  auth: {
    loggedIn: true,
  },
};

export default handler;
