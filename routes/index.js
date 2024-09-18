import { Router } from "express";
import {
  removeFolder,
  renderFolderPage,
  getRootFolderId,
  createFolderAndValidationMiddlewares,
  renameFolderAndValidationMiddlewares,
} from "../controllers/index.js";
import filesRouter from "./files.js";
import { recursivelyDeleteSharedFolderUrlIfExpiredMiddleware } from "../middlewares/folders.js";

const router = Router();

router.all("/", recursivelyDeleteSharedFolderUrlIfExpiredMiddleware);

router.get("/rootFolderId", getRootFolderId);
router.get("/", renderFolderPage);
router.get("/favicon.ico", (req, res) => {
  return res.status(200).end();
});

router.all("/folders/:id", recursivelyDeleteSharedFolderUrlIfExpiredMiddleware);

router.get("/folders/:id", renderFolderPage);
router.post("/folders/:id", createFolderAndValidationMiddlewares);
router.patch("/folders/:id", renameFolderAndValidationMiddlewares);
router.delete("/folders/:id", removeFolder);

router.use("/folders/:folderId/files", filesRouter);

export default router;
