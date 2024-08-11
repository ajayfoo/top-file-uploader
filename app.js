import express from "express";
import "dotenv/config";
import configuredSession from "./middlewares/session.js";
import authRouter from "./routes/auth.js";
import indexRouter from "./routes/index.js";
import auth from "./middlewares/auth.js";

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(configuredSession);
app.use(auth.session());
app.use("/auth", authRouter);
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/auth/login");
  }
});
app.use("/", indexRouter);
app.listen(process.env.PORT, () => {
  console.log("Listening on PORT: " + process.env.PORT);
});
