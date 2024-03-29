import { RouteDetails } from "../types/route";

export default {
  method: "GET",
  path: "/forgot-password",
  handler: (req, res) => {
    // Check if logged in
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }

    return res.status(200).render("forgot_password");
  }
} as RouteDetails