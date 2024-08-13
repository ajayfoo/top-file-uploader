import auth from "../middlewares/auth.js";
import bcrypt from "bcrypt";
import db from "../db.js";

const renderSignUpPage = (req, res) => {
  res.render("signup");
};

const signUp = async (req, res, next) => {
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
};

const renderLoginPage = (req, res) => {
  res.render("login");
};

const login = auth.authenticate("local", {
  successRedirect: "../../",
  failureRedirect: "/auth/login",
});

export { renderSignUpPage, signUp, renderLoginPage, login };
