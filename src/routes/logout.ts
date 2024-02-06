import { RouteDetails } from "../types/route";

export default {
  method: "GET",
  path: "/logout",
  handler: (req, res) => {
    // Check if logged in
    if (!req.isAuthenticated()) {
      return res.redirect("/");
    }

    req.logOut(() => {
      return res.status(200).redirect("/");
    });
  }
} as RouteDetails