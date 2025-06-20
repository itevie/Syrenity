import config from "../../../../config";
import database from "../../../../database/database";
import SyrenityError from "../../../../errors/BaseError";
import SyFile from "../../../../models/File";
import SyServer, { EditServerOptions } from "../../../../models/Servers";
import { RouteDetails } from "../../../../types/route";
import permissionsBitfield from "../../../../util/PermissionBitfield";

const route: RouteDetails<EditServerOptions> = {
  method: "PATCH",
  path: "/servers/:server",

  handler: async (req, res) => {
    const body = req.body as EditServerOptions;

    if (
      body.avatar &&
      !(await SyFile.fetch(body.avatar))?.data.mime?.startsWith("image/")
    ) {
      return res.status(400).send(
        new SyrenityError({
          message: "The avatar file must be an image",
          errorCode: "InvalidFileType",
          statusCode: 400,
        }).extract(),
      );
    }

    const server = await SyServer.fetch(parseInt(req.params.server));
    await server.edit(body);
    return res.status(200).send(server.data);
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.ManageServer,
    guildParam: "server",
  },

  body: {
    type: "object",
    properties: {
      name: {
        type: "string",
        ...config.validity.servers.name,
        nullable: true,
      },
      avatar: {
        type: "string",
        nullable: true,
      },
    },
  },
};

export default route;
