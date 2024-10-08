import express from "express";
import "dotenv/config";
import configuredSession from "./middlewares/session.js";
import authRouter from "./routes/auth.js";
import indexRouter from "./routes/index.js";
import sharedRouter from "./routes/shared.js";
import sharedUrlsRouter from "./routes/sharedUrls.js";
import auth from "./middlewares/auth.js";
import { checkUsernameAvailability } from "./controllers/username.js";
import createHttpError from "http-errors";

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(configuredSession);
app.use(auth.session());
app.head("/users/:username", checkUsernameAvailability);

app.use("/auth", authRouter);
app.use("/", sharedRouter);

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/auth/login");
  }
});

app.use("/", indexRouter);
app.use("/", sharedUrlsRouter);

app.use(function (req, res, next) {
  next(createHttpError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  if (err.message === "USER_NOT_FOUND") {
    return res.clearCookie("connect.sid").redirect(303, "/").end();
  }
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  res.status(err.statusCode);
  if (!err.statusCode) {
    res.status(500);
  }
  res.render("error", { error: err });
});

app.listen(process.env.PORT, () => {
  console.log("Listening on PORT: " + process.env.PORT);
});
