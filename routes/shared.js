import { Router } from "express";
import {
  renderFolderPage,
  renderFileInfoPage,
  getFile,
} from "../controllers/shared.js";
import {
  deleteSharedFileUrlIfExpiredMiddleware,
  recursivelyDeleteSharedFolderUrlIfExpiredMiddleware,
} from "../middlewares/shared.js";

const router = Router();

router.all(
  "/sharedFolders/:id",
  recursivelyDeleteSharedFolderUrlIfExpiredMiddleware,
);
router.all("/sharedFiles/:id", deleteSharedFileUrlIfExpiredMiddleware);

router.get("/sharedFolders/:id", renderFolderPage);
router.get("/sharedFiles/:id", renderFileInfoPage);
router.get("/sharedFiles/:id/blob", getFile);

export default router;
