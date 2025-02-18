import { RouteDetails } from "../../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/api/ping",
  handler: (req, res) => {
    return res.status(200).send({
      message: "Pong!",
      user: req.user,
    });
  },
};

export default handler;
