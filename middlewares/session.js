import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";
import { db } from "../db.js";

const sessionStore = new PrismaSessionStore(db, {
  checkPeriod: 1000 * 60 * 60 * 24,
});
const configuredSession = session({
  secret: process.env.EXPRESS_SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
  store: sessionStore,
});

export default configuredSession;
