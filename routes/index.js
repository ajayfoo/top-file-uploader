import { Router } from "express";
import {
  createFolder,
  renameFolder,
  removeFolder,
  renderFolderPage,
  getRootFolderId,
} from "../controllers/index.js";
import filesRouter from "./files.js";
import { recursivelyDeleteSharedFolderUrlIfExpiredMiddleware } from "../middlewares/folders.js";

const router = Router();

router.get("/rootFolderId", getRootFolderId);

router.use("/", recursivelyDeleteSharedFolderUrlIfExpiredMiddleware);
router.get("/", renderFolderPage);
router.get("/favicon.ico", (req, res) => {
  return res.status(200).end();
});

router.use("/folders/:id", recursivelyDeleteSharedFolderUrlIfExpiredMiddleware);

router.get("/folders/:id", renderFolderPage);
router.post("/folders/:id", createFolder);
router.patch("/folders/:id", renameFolder);
router.delete("/folders/:id", removeFolder);

router.use("/folders/:folderId/files", filesRouter);

export default router;
