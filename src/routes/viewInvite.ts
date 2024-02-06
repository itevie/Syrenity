import { RouteDetails } from "../types/route";
import * as database from "../database";

export default {
  method: "GET",
  path: "/invites/:id",
  handler: async (req, res) => {
    // Check if logged in
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    // Fetch the invite
    const invite = await database.actions.invites.fetch(req.params.id);

    // Fetch the guild
    const guild = await database.actions.guilds.fetch(invite.guild_id);

    return res.status(200).render("view_invite", {
      guild_image: guild.avatar,
      guild_name: guild.name,
      guild_id: guild.id,
      invite_code: invite.id,
    });
  }
} as RouteDetails