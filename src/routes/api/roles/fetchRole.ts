import * as database from '../../../database';
import { RouteDetails } from "../../../types/route";

export default {
  method: "GET",
  path: "/api/guilds/:id/roles/:roleId",
  handler: async (req, res) => {
    // Obtain details
    const guildId = parseInt(req.params.id);
    const roleId = parseInt(req.params.roleId);

    const role = await database.actions.guilds.roles.fetchRole(roleId);

    return res.status(200).send(role); 
  },
  details: {
    auth: {
      loggedIn: true,
    },
    params: {
      id: {
        is: 'guild',
        canView: true
      },
      roleId: {
        is: "role"
      }
    }
  }
} as RouteDetails