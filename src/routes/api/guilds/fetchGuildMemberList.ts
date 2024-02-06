import { RouteDetails } from "../../../types/route";
import * as database from '../../../database';
import { computeBitField } from "../../../util/permissions";

export default {
  method: "GET",
  path: "/api/guilds/:id/members",
  handler: async (req, res) => {
    // Get the details
    const guildId = parseInt(req.params.id);

    // Fetch the guild members
    const members = await database.actions.guilds.members.fetchAll(guildId);

    const extendedMembers: MemberExtended[] = [];

    for await (const member of members) {
      const newMember: MemberExtended = {...member, permissions_bitfield: 0};
      newMember.permissions_bitfield = await computeBitField({
        guildId,
        userId: member.user_id
      });
      extendedMembers.push(newMember);
    }

    return res.status(200).send({
      members: extendedMembers,
    });
  },
  details: {
    params: {
      id: {
        is: "guild",
        canView: true,
      }
    },
  }
} as RouteDetails