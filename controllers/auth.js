import auth from "../middlewares/auth.js";
import bcrypt from "bcrypt";
import db from "../db.js";
import { body, validationResult } from "express-validator";
import { usernameIsAvailable } from "./username.js";

const renderSignUpPage = (req, res) => {
  res.render("signup", { errors: {} });
};

const validateSignUpFormFields = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .escape()
    .isLength({ min: 3, max: 25 })
    .withMessage("Username must be 3-25 characters long")
    .bail()
    .custom(async (value) => {
      const isAvailable = await usernameIsAvailable(value);
      return isAvailable;
    })
    .withMessage("Username is not available"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be 8-128 characters long")
    .isStrongPassword({ minSymbols: 1, minLowercase: 1, minUppercase: 1 })
    .withMessage(
      "Password must contain at least one lowercase and uppercase letter, number and special character",
    ),
  body("confirm_password")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords must match"),
];

const getFormattedValidationErrors = (validationResult) => {
  return validationResult.array().reduce((acc, curr) => {
    if (!acc[curr.path]) {
      acc[curr.path] = [curr.msg];
    } else {
      acc[curr.path].push(curr.msg);
    }
    return acc;
  }, {});
};
const handleSignUpFromValidationErrors = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  const errors = getFormattedValidationErrors(result);
  res.render("signup", { errors });
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
  req.login(userForSession, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("../../");
  });
};

const validaionAndSignUpMiddlewares = [
  ...validateSignUpFormFields,
  handleSignUpFromValidationErrors,
  signUp,
];

const renderLoginPage = (req, res) => {
  res.render("login", { errors: {}, invalidCredential: false });
};

const validateLoginFormFields = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .escape()
    .isLength({ max: 25 })
    .withMessage("Username must be at most 25 characters long"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 128 })
    .withMessage("Password must be at most 128 characters long"),
];

const handleLoginFromValidationErrors = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  const errors = getFormattedValidationErrors(result);
  res.render("login", { errors, invalidCredential: false });
};

// const login = auth.authenticate("local", {
//   successRedirect: "../../",
//   failureRedirect: "/auth/login",
// });

const login = (req, res, next) => {
  auth.authenticate("local", (err, user) => {
    console.log(user);
    if (err) return next(err);
    if (!user) {
      res.render("login", { errors: {}, invalidCredential: true });
      return;
    }
    const userForSession = {
      id: user.id,
    };
    req.login(userForSession, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("../../");
    });
  })(req, res, next);
};

const validaionAndLoginMiddlewares = [
  ...validateLoginFormFields,
  handleLoginFromValidationErrors,
  login,
];

export {
  renderSignUpPage,
  validaionAndSignUpMiddlewares,
  renderLoginPage,
  validaionAndLoginMiddlewares,
};
