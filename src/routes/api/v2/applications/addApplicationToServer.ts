import SyrenityError from "../../../../errors/BaseError";
import SyApplication from "../../../../models/Application";
import SyMember from "../../../../models/Member";
import { RouteDetails } from "../../../../types/route";
import permissionsBitfield from "../../../../util/PermissionBitfield";

const handler: RouteDetails = {
  path: "/applications/:application/servers/:server",
  method: "POST",

  handler: async (req, res) => {
    const applicationId = parseInt(req.params["application"]);
    const serverId = parseInt(req.params["server"]);

    const alreadyJoined = await SyMember.has(serverId, applicationId);
    if (alreadyJoined) {
      return res.status(400).send(
        new SyrenityError({
          message: "Application already in destination server",
          errorCode: "ApplicationAlreadyJoined",
          statusCode: 400,
        }).extract()
      );
    }

    const application = await SyApplication.fetchByUserId(applicationId);

    if (application.data.public == false) {
      return res.status(400).send(
        new SyrenityError({
          message:
            "Application is not public, cannot invite via application ID",
          errorCode: "ApplicationNotPublic",
          statusCode: 400,
        }).extract()
      );
    }

    await SyMember.create(serverId, applicationId);

    return res.status(200).send({ message: "Application added to server " });
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.ManageServer,
    guildParam: "server",
  },

  params: {
    application: {
      is: "user",
    },
    server: {
      is: "guild",
      canView: true,
    },
  },
};

export default handler;
