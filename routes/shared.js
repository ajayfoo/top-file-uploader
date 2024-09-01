import { Router } from "express";
import { render, renderFileInfo } from "../controllers/sharedUrl.js";

const router = Router();

router.get("/:id", render);
router.get("/files/:id", renderFileInfo);

export default router;
