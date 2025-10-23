import SyChannel from "../../../../models/Channel";
import SyRelationship from "../../../../models/Relationship";
import { RouteDetails } from "../../../../types/route";

const route: RouteDetails = {
  path: "/users/:user/relationships/:recipient/ensure",
  method: "POST",

  handler: async (req, res) => {
    let ids = [
      parseInt(req.params.user),
      parseInt(req.params.recipient),
    ] as const;

    let relationship: SyRelationship;
    let channel: SyChannel;

    if (!(await SyRelationship.existsBetween(...ids))) {
      relationship = await SyRelationship.create(...ids);
    } else {
      relationship = await SyRelationship.fetch(...ids);
    }

    channel = await SyChannel.fetch(relationship.data.channel_id);

    return res.status(200).send({
      channel,
      relationship: await relationship.expand(),
    });
  },

  auth: {
    loggedIn: true,
  },

  params: {
    user: {
      is: "user",
    },
    recipient: {
      is: "user",
      canView: true,
    },
  },
};

export default route;
