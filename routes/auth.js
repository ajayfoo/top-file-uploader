import { Router } from "express";
import auth from "../middlewares/auth.js";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = Router();

router.get("/signup", (req, res) => {
  res.render("signup");
});
router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;
  const saltRounds = parseInt(process.env.SALT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = await db.user.create({
    data: {
      username,
      password: passwordHash,
    },
  });
  const userForSession = {
    id: newUser.id,
  };
  console.log(newUser);
  req.logIn(userForSession, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("../../");
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});
router.post(
  "/login",
  auth.authenticate("local", {
    successRedirect: "../../",
    failureRedirect: "/auth/login",
  }),
);

export default router;
