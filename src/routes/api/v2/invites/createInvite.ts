import SyrenityError from "../../../../errors/BaseError";
import SyChannel from "../../../../models/Channel";
import SyInvite, { CreateInviteOptions } from "../../../../models/Invite";
import SyServer from "../../../../models/Servers";
import { RouteDetails } from "../../../../types/route";
import permissionsBitfield from "../../../../util/PermissionBitfield";

let handler: RouteDetails<CreateInviteOptions> = {
  method: "POST",
  path: "/servers/:server/invites",

  handler: async (req, res) => {
    const body = req.body as CreateInviteOptions;
    const server = await SyServer.fetch(parseInt(req.params.server));

    // Validate body.channel_id
    if (body.channel_id) {
      if (!(await SyChannel.exists(body.channel_id))) {
        return res.status(400).send(
          new SyrenityError({
            message: "Unknown channel ID in body",
            errorCode: "NonexistentResource",
          })
        );
      }
    }

    const invite = await SyInvite.create(
      server.data.id,
      (req.user as User).id,
      body
    );

    return res.status(200).send(await invite.expand());
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.CreateInvites,
    guildParam: "server",
  },

  params: {
    server: {
      is: "guild",
      canView: true,
    },
  },

  body: {
    type: "object",
    properties: {
      id: {
        type: "string",
        nullable: true,
      },

      channel_id: {
        type: "number",
        nullable: true,
      },

      max_uses: {
        type: "number",
        nullable: true,
        minimum: 1,
        maximum: 5000,
      },

      expires_in: {
        type: "number",
        nullable: true,
        minimum: 6000,
        maximum: 2.592e9,
      },
    },
  },
};

export default handler;
