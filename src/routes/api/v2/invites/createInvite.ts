import SyrenityError from "../../../../errors/BaseError";
import { RouteDetails } from "../../../../types/route";
import { actions } from "../../../../util/database";
import permissionsBitfield from "../../../../util/PermissionBitfield";

interface CreateInviteBody {
  channel_id?: number | null;
  max_uses?: number | null;
  expires_in?: number | null;
}

let handler: RouteDetails<CreateInviteBody> = {
  method: "POST",
  path: "/servers/:server/invites",

  handler: async (req, res) => {
    // Collect details
    let body = req.body as CreateInviteBody;
    let server = parseInt(req.params["server"] as string);

    // Validate body.channel_id
    if (body.channel_id) {
      if (!(await actions.channels.exists(body.channel_id)))
        return res.status(400).send(
          new SyrenityError({
            message: "Unknown channel ID in body",
            errorCode: "NonexistentResource",
          }).extract()
        );
    }

    // Create invite
    let invite = await actions.invites.create({
      id: await actions.invites.generateInviteID(),
      guildId: server,
      createdBy: (req.user as User).id,
      maxUses: body.max_uses,
      expiresIn: body.expires_in,
      channelId: body.channel_id,
    });

    return res.status(200).send(invite);
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
