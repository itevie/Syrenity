import fs from "fs";
import { RouteDetails } from "../types/route";

const handler: RouteDetails = {
  method: "GET",
  path: "/",
  alternatePaths: ["/login", "/register", "/channels/:g?/:c?", "/s"],
  handler: (req, res) => {
    return res
      .status(200)
      .send(
        fs.readFileSync(__dirname + "/../client/build/index.html", "utf-8"),
      );
  },

  auth: {
    forCrawlers: async () => {
      return {};
    },
  },
};

export default handler;
