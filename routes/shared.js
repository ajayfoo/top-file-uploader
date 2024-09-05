import { Router } from "express";
import { renderFolderPage, renderFileInfoPage } from "../controllers/shared.js";
import {
  deleteSharedFileUrlIfExpiredMiddleware,
  recursivelyDeleteSharedFolderUrlIfExpiredMiddleware,
} from "../middlewares/shared.js";

const router = Router();

router.use(
  "/sharedFolders/:id",
  recursivelyDeleteSharedFolderUrlIfExpiredMiddleware,
);
router.use("/sharedFiles/:id", deleteSharedFileUrlIfExpiredMiddleware);

router.get("/sharedFolders/:id", renderFolderPage);
router.get("/sharedFiles/:id", renderFileInfoPage);

export default router;
