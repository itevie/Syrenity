import SyServer from "../../../../models/Servers";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/servers/:id/members",
  handler: async (req, res, next) => {
    try {
      return res
        .status(200)
        .send(
          await (
            await SyServer.fetch(parseInt(req.params.id))
          ).fetchMembersWithUser()
        );
    } catch (e) {
      next(e);
    }
  },

  auth: {
    loggedIn: true,
  },

  params: {
    id: {
      is: "guild",
    },
  },
};

export default handler;
