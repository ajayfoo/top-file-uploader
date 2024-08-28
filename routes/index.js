import { Router } from "express";
import {
  createFolder,
  renameFolder,
  removeFolder,
  createSharedUrl,
  renderFolderPage,
  getRootFolderId,
} from "../controllers/index.js";
import filesRouter from "./files.js";

const router = Router();

router.get("/rootFolderId", getRootFolderId);

router.get("/", renderFolderPage);
router.get("/favicon.ico", (req, res) => {
  return res.status(200).end();
});
router.get("/folders/:id", renderFolderPage);

router.post("/folders/:id", createFolder);

router.put("/sharedUrls/:id", createSharedUrl);
router.put("/sharedUrls", createSharedUrl);

router.patch("/folders/:id", renameFolder);
router.delete("/folders/:id", removeFolder);

router.use("/folders/:folderId/files", filesRouter);

export default router;
