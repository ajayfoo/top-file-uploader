import { Router } from "express";
import {
  login,
  renderLoginPage,
  renderSignUpPage,
  validaionAndSignUpMiddlewares,
} from "../controllers/auth.js";

const router = Router();

router.get("/signup", renderSignUpPage);
router.post("/signup", validaionAndSignUpMiddlewares);
router.get("/login", renderLoginPage);
router.post("/login", login);

export default router;
