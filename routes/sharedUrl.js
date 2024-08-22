import { Router } from "express";
import { render } from "../controllers/sharedUrl.js";

const router = Router();

router.get("/:id", render);

export default router;
