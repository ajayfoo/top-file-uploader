import { Router } from "express";
import { renderFolderPage, renderFileInfoPage } from "../controllers/shared.js";

const router = Router();

router.get("/:id", renderFolderPage);
router.get("/files/:id", renderFileInfoPage);

export default router;
