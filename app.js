import express from "express";
import "dotenv/config";
import configuredSession from "./middlewares/session.js";
import authRouter from "./routes/auth.js";
import auth from "./middlewares/auth.js";
import bodyParser from "body-parser";

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(process.env.PORT, () => {
  console.log("Listening on PORT: " + process.env.PORT);
});
