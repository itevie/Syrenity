import { RouteDetails } from "../../types/route";

export default {
  method: "GET",
  path: "/developers/applications",
  alternatePaths: ["/developers"],
  handler: (req, res) => {
    return res.status(200).render("developers/applications");
  },
  details: {
    auth: {
      loggedIn: true,
    }
  }
} as RouteDetails