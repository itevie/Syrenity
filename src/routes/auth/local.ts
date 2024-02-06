import passport from 'passport';
import { RouteDetails } from "../../types/route";

export default {
  method: "POST",
  path: "/auth/password",
  handler: (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User) => {
      // Check if there was an error
      if (err) return next(err);

      // Check if user was returned
      if (!user) {
        return res.status(401).send({
          message: "Failed to login"
        });
      } else {
        req.logIn(user, err => {
          if (err) return next(err);

          return res.status(200).redirect("/");
        });
      }
    })(req, res, next);
  }
} as RouteDetails