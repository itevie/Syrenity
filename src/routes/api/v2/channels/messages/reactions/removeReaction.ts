import SyrenityError from "../../../../../../errors/BaseError";
import SyMessage from "../../../../../../models/Message";
import SyReaction from "../../../../../../models/Reaction";
import { RouteDetails } from "../../../../../../types/route";

const route: RouteDetails = {
  method: "DELETE",
  path: "/channels/:channel/messages/:message/reactions/:emoji",

  handler: async (req, res) => {
    const message = await SyMessage.fetch(parseInt(req.params.message));
    const emoji = req.params.emoji as string;
    const user = req.user as User;
    const reaction = await SyReaction.getSpecific(
      message.data.id,
      user.id,
      emoji
    );

    if (!reaction)
      return res.status(400).send(
        new SyrenityError({
          message: "You have not reacted with that emoji",
          errorCode: "UnknownError",
          statusCode: 400,
        })
      );

    await reaction.remove();

    return res.status(200).send({
      message: "Removed",
    });
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
