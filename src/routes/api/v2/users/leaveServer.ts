import SyMember from "../../../../models/Member";
import SyServer from "../../../../models/Servers";
import { RouteDetails } from "../../../../types/route";

const route: RouteDetails = {
  method: "DELETE",
  path: "/users/:user/servers/:server",

  handler: async (req, res) => {
    const server = await SyServer.fetch(parseInt(req.params.server));
    const member = await SyMember.fetch(server.data.id, (req.user as User).id);

    await member.remove();

    return res.status(200).send({
      message: "Left the server",
    });
  },

  auth: {
    loggedIn: true,
  },

  params: {
    user: {
      is: "user",
      mustBeSelf: true,
    },
    server: {
      is: "guild",
      canView: true,
    },
  },
};

export default route;
