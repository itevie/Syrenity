import fs from "fs";
import { RouteDetails } from "../types/route";
import SyInvite from "../models/Invite";
import SyServer from "../models/Servers";
import SyMember from "../models/Member";

const handler: RouteDetails = {
  method: "GET",
  path: "/invites/:invite",
  handler: (req, res) => {
    return res
      .status(200)
      .send(
        fs.readFileSync(__dirname + "/../client/build/index.html", "utf-8"),
      );
  },

  auth: {
    forCrawlers: async (req) => {
      let invite = await SyInvite.fetch(req.params.invite);
      let guild = await SyServer.fetch(invite.data.guild_id);
      let members = await SyMember.fetchAll(guild.data.id);

      return {
        title: "Syrenity",
        description: `You've been invited to ${guild.data.name}! Click here to join now and chat to ${members.length} others!`,
        image: `${req.headers["x-forwarded-proto"] ?? "http"}://${req.headers.host}/files/${guild.data.avatar}`,
      };
    },
  },
};

export default handler;
