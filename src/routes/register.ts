import { RouteDetails } from "../types/route";
import { index } from "./home";

export default {
  method: "GET",
  path: "/register",
  handler: (req, res) => {
    // Check if logged in
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    
    return res.status(200).send(index)
  }
} as RouteDetails