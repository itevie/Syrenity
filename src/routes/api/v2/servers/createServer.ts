import config from "../../../../config";
import SyServer, { CreateServerOptions } from "../../../../models/Servers";
import { RouteDetails } from "../../../../types/route";

const route: RouteDetails<CreateServerOptions> = {
  method: "POST",
  path: "/servers",

  handler: async (req, res) => {
    const server = await SyServer.create(
      (req.user as User).id,
      req.body as CreateServerOptions
    );

    return res.status(200).send(server.data);
  },

  body: {
    type: "object",
    properties: {
      name: {
        type: "string",
        ...config.validity.servers.name,
      },
    },
    required: ["name"],
    additionalProperties: false,
  },

  auth: {
    loggedIn: true,
  },
};

export default route;
