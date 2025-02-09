import { RouteDetails } from "../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/",
  handler: async (req, res, next) => {
    try {
    } catch (e) {
      next(e);
    }
  },
};

export default handler;
