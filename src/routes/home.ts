// This file contains all the paths
// for the React project.

import fs from "fs";
import { RouteDetails } from "../types/route";

const index = fs.readFileSync(__dirname + "/../public/index.html", "utf-8");

const handler: RouteDetails = {
  method: "GET",
  path: "/",
  alternatePaths: ["/login", "/channels/:g?/:c?"],
  handler: (req, res) => {
    return res
      .status(200)
      .send(
        fs.readFileSync(__dirname + "/../client/build/index.html", "utf-8")
      );
  },
};

export default handler;
