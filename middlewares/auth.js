import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import db from "../db.js";

const localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const targetUser = await db.user.findUnique({
      where: {
        username,
      },
    });
    if (!targetUser) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    const isAMatch = await bcrypt.compare(password, targetUser.password);
    if (!isAMatch) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    return done(null, { id: targetUser.id });
  } catch (err) {
    return done(err);
  }
});
passport.use(localStrategy);
passport.serializeUser((user, done) => {
  done(null, { id: user.id });
});
passport.deserializeUser(async (user, done) => {
  try {
    const targetUser = await db.user.findUnique({
      where: { id: user.id },
    });
    if (!targetUser) {
      done(new Error("User not found"));
      return;
    }
    done(null, { id: targetUser.id });
  } catch (err) {
    done(err);
  }
});

export default passport;
