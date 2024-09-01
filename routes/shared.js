import { Router } from "express";
import { renderFolderPage, renderFileInfoPage } from "../controllers/shared.js";

const router = Router();

router.get("/sharedFolders/:id", renderFolderPage);
router.get("/sharedFiles/:id", renderFileInfoPage);

export default router;
