import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "../db.js";

const localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const targetUser = await db.user.findUnique({
      where: {
        username,
      },
      include: {
        folders: {
          where: {
            parentId: null,
          },
        },
      },
    });
    if (!targetUser) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    const isAMatch = await bcrypt.compare(password, targetUser.password);
    if (!isAMatch) {
      return done(null, false, { message: "Incorrect username or password" });
    }
    return done(null, {
      id: targetUser.id,
      rootFolderId: targetUser.folders[0].id,
    });
  } catch (err) {
    return done(err);
  }
});
passport.use(localStrategy);
passport.serializeUser((user, done) => {
  done(null, { id: user.id, rootFolderId: user.rootFolderId });
});
passport.deserializeUser(async (user, done) => {
  try {
    const targetUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        folders: {
          where: {
            id: user.rootFolderId,
          },
        },
      },
    });
    if (!targetUser) {
      done(new Error("USER_NOT_FOUND"));
      return;
    }
    done(null, { id: targetUser.id, rootFolderId: targetUser.folders[0].id });
  } catch (err) {
    done(err);
  }
});

export default passport;
