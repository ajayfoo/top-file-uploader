import { Router } from "express";
import {
  renderLoginPage,
  renderSignUpPage,
  validaionAndSignUpMiddlewares,
  validaionAndLoginMiddlewares,
  logout,
} from "../controllers/auth.js";

const router = Router();

router.get("/signup", renderSignUpPage);
router.post("/signup", validaionAndSignUpMiddlewares);
router.get("/login", renderLoginPage);
router.post("/login", validaionAndLoginMiddlewares);
router.post("/logout", logout);

export default router;
