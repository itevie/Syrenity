import SyrenityError from "../../../../errors/BaseError";
import SyInvite from "../../../../models/Invite";
import SyMember from "../../../../models/Member";
import { RouteDetails } from "../../../../types/route";

const handler: RouteDetails = {
  method: "POST",
  path: "/invites/:inviteId",

  handler: async (req, res) => {
    const user = req.user as User;
    const invite = await SyInvite.fetch(req.params.inviteId);

    if (await SyMember.has(invite.data.guild_id, user.id)) {
      return res.status(400).send(
        new SyrenityError({
          errorCode: "AlreadyAMember",
          message: `You are already a member of this server`,
        }).extract()
      );
    }

    const member = await invite.use(user.id);

    return res.status(200).send(member.data);
  },

  auth: {
    loggedIn: true,
    disallowBots: true,
  },

  params: {
    inviteId: {
      is: "invite",
      canView: null,
    },
  },
};

export default handler;
