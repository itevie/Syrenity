import passport from "passport";
import { RouteDetails } from "../../types/route";

const handler: RouteDetails = {
  method: "POST",
  path: "/auth/password",
  handler: (req, res, next) => {
    passport.authenticate("local", (err: Error, user: FullUser) => {
      console.log(err, user);
      // Check if there was an error
      if (err) return next(err);

      // Check if the user was returned
      if (!user) {
        return res.status(401).send({
          message: `An unknown error occured whilst trying to log you in`,
        });
      }

      // Login
      req.logIn(user, (err) => {
        if (err) return next(err);

        // Done
        return res.status(200).send({ message: "test" });
      });
    })(req, res, next);
  },
};

export default handler;
