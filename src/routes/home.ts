import { RouteDetails } from "../types/route";
import fs from "fs";

const index = fs.readFileSync(__dirname + "/../public/index.html", "utf-8");

export default {
  method: "GET",
  path: "/",
  alternatePaths: ["/channels/:gid/:cid", "/channels/:gid"],
  handler: (req, res) => {
    // Check if logged in
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    return res.status(200).send(index);
  }
} as RouteDetails

export {index};