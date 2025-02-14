import SyrenityError from "../../../../../../errors/BaseError";
import SyMessage from "../../../../../../models/Message";
import SyReaction from "../../../../../../models/Reaction";
import { RouteDetails } from "../../../../../../types/route";

const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;

const route: RouteDetails = {
  method: "POST",
  path: "/channels/:channel/messages/:message/reactions/:emoji",

  handler: async (req, res) => {
    const message = await SyMessage.fetch(parseInt(req.params.message));
    const emoji = (req.params.emoji as string).trim();

    if (!emojiRegex.test(emoji))
      return res.status(400).send(
        new SyrenityError({
          message: "Not an emoji",
          errorCode: "BadEmoji",
          statusCode: 400,
        }).extract()
      );

    const user = req.user as User;
    const reaction = await SyReaction.create(message.data.id, user.id, emoji);
    return res.status(200).send(reaction);
  },

  auth: {
    loggedIn: true,
  },

  params: {
    channel: {
      is: "channel",
      canView: true,
    },
    message: {
      is: "message",
      canView: true,
    },
  },
};

export default route;
