import { Router } from "express";
import { createSharedUrl } from "../controllers/index.js";

const router = Router();
router.put("/:id", createSharedUrl);
router.put("/", createSharedUrl);

export default router;
