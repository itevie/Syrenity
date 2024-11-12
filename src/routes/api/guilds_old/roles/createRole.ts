import { RouteDetails } from "../../../../types/route";
import config from "../../../../config.json";
import permissionsBitfield from "../../../../util/PermissionBitfield";
import { getBitfieldForMember } from "../../../../util/permissionChecker";
import { actions } from "../../../../util/database";
import SyrenityError from "../../../../errors/BaseError";

interface CreateRoleBody {
  name: string;
  bitfield_allow: number;
  bitfield_deny: number;
  color?: string | null;
  rank?: number;
}

const handler: RouteDetails<CreateRoleBody> = {
  method: "POST",
  path: "/api/guilds/:guildId/roles",

  handler: async (req, res) => {
    // Collect data
    let guildId = parseInt(req.params["guildId"]);
    let body: CreateRoleBody = req.body as CreateRoleBody;
    body = { ...config.defaults.roles, ...body };

    // Get the member's permissions
    let permissions = await getBitfieldForMember({
      user: req.user as User,
      guild: await actions.guilds.fetch(guildId),
    });

    // Check if the user has the permissions they are trying to create
    if (!(permissions & body.bitfield_allow))
      return res.status(400).send(
        new SyrenityError({
          message: `You cannot create a role with permissions you do not have yourself`,
          errorCode: "MissingPermissions",
        }).extract()
      );

    // Create role
    const role = await actions.roles.create(guildId, {
      name: body.name,
      bitfieldAllow: body.bitfield_allow,
      bitfieldDeny: body.bitfield_deny,
      color: body.color || null,
      rank: body.rank || -1,
    });

    return res.status(200).send(role);
  },

  auth: {
    loggedIn: true,
  },

  permissions: {
    permissions: permissionsBitfield.ManageRoles,
    guildParam: "guildId",
  },

  body: {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: config.validity.roles.name.minLength,
        maxLength: config.validity.roles.name.maxLength,
        nullable: false,
      },
      color: {
        type: "string",
        maxLength: 7,
        minLength: 7,
        nullable: true,
      },
      bitfield_allow: {
        type: "number",
      },
      bitfield_deny: {
        type: "number",
      },
      rank: {
        type: "number",
        nullable: true,
      },
    },
    required: ["name"],
  },

  params: {
    guildId: {
      is: "guild",
    },
  },
};

export default handler;
