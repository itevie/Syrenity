import SyrenityError from "../../../../errors/BaseError";
import SyMember from "../../../../models/Member";
import SyServer from "../../../../models/Servers";
import SyUser from "../../../../models/User";
import { RouteDetails } from "../../../../types/route";

const route: RouteDetails = {
  method: "DELETE",
  path: "/users/:user/servers/:server",

  handler: async (req, res) => {
    const server = await SyServer.fetch(parseInt(req.params.server));
    const member = await SyMember.fetch(
      server.data.id,
      (req.user as SyUser).data.id
    );

    console.log(req.user);

    if (server.data.owner_id == (req.user as SyUser).data.id) {
      return res.status(404).send(
        new SyrenityError({
          message: "Cannot leave as you are the owner of the server",
          errorCode: "UnallowedServerOwnerAction",
          statusCode: 404,
        })
      );
    }

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
