import BaseError from "../../../errors/BaseError";
import { RouteDetails } from "../../../types/route";
import { actions } from "../../../util/database";
import { send } from "../../../ws/websocketUtil";

const handler: RouteDetails = {
    method: "POST",
    path: "/api/invites/:inviteId",

    handler: async (req, res) => {
        const user = req.user as User;
        const inviteId = req.params.inviteId as string;
        const invite = await actions.invites.fetch(inviteId);

        // Check if the user is already in the guild
        if (await actions.members.hasMember(user.id, invite.guild_id)) {
            return res.status(400).send(new BaseError({
                errorCode: "AlreadyAMember",
                message: `You are already a member of this server`
            }).extract());
        }

        // Add user
        const member = await actions.members.addTo(user.id, invite.guild_id);

        // Broadcast
        send({
            guildId: invite.guild_id,
            type: "GuildMemberAdd",
            data: {
                member,
            }
        });

        return res.status(200).send(member);
    },

    auth: {
        loggedIn: true,
        disallowBots: true,
    },

    params: {
        inviteId: {
            is: "invite",
            canView: null,
        }
    }
};

export default handler;