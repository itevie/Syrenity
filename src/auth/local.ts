import passport from "passport";
import LocalStrategy from "passport-local";
import * as bcrypt from "bcrypt";
import * as database from "../util/database";

passport.use(
    new LocalStrategy.Strategy(
        async (username: string, password: string, cb: Function) => {
            try {
                // Fetch the user by their email
                const user = await database.actions.users.fetchByEmail(username);

                // Check passwords
                if ((await bcrypt.compare(password, user.password)) === false)
                    return cb(null, false);

                // Success
                return cb(null, user);
            } catch (err) {
                console.error("Authentication error:");
                console.error(err);
                return cb(null, false);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: FullUser, done) => {
    done(null, user);
});