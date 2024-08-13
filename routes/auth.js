import { Router } from "express";
import {
  login,
  renderLoginPage,
  renderSignUpPage,
  signUp,
} from "../controllers/auth.js";

const router = Router();

router.get("/signup", renderSignUpPage);
router.post("/signup", signUp);
router.get("/login", renderLoginPage);
router.post("/login", login);

export default router;
