import { RouteDetails } from "../types/route";
import * as database from "../database";
import { index } from "./home";

export default {
  method: "GET",
  path: "/invites/:id",
  handler: async (req, res) => {
    // Check if logged in
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
    return res.status(200).send(index);
  }
} as RouteDetails