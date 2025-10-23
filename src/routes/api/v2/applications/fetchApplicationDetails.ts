import SyApplication from "../../../../models/Application";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  path: "/applications/:user",
  method: "GET",

  handler: async (req, res) => {
    let result = await SyApplication.fetchByUserId(parseInt(req.params.user));
    return res.status(200).send(await result.expand());
  },

  auth: {
    loggedIn: true,
  },

  params: {
    user: {
      is: "user",
    },
  },
};

export default handler;
