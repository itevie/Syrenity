import passport from "passport";
import LocalStrategy from 'passport-local';
import * as bcrypt from 'bcrypt';
import * as database from '../database';

passport.use(
  new LocalStrategy.Strategy(
    async (username: string, password: string, cb: Function) => {
      try {
        // Fetch user
        const user = await database.actions.users.fetchByEmail(username.toLowerCase());

        // Check passwords
        if ((await bcrypt.compare(password, user.password)) === false)
          return cb(null, false);

        // Success
        return cb(null, user);
      } catch (err) {
        console.log(err);
        return cb(null, false);
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: User, done) => {
  done(null, user);
});
