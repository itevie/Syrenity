import * as database from '../../../database';
import { RouteDetails } from "../../../types/route";
import PermissionBitfield from '../../../util/PermissionBitfield';

export default {
  method: "POST",
  path: "/api/guilds/:guildId/invites",
  handler: async (req, res) => {
    // Fetch details
    const guildid = parseInt(req.params.guildId);

    // Create the invite
    const invite = await database.actions.invites.create(guildid, (req.user as User).id);

    return res.status(200).send(invite);
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      guildId: {
        is: "guild",
        canView: true,
      }
    },
    permissions: {
      required: [
        PermissionBitfield.CREATE_INVITE
      ]
    }
  }
} as RouteDetails