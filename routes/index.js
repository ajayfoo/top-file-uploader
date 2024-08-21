import { Router } from "express";
import {
  renderIndex,
  fileUploadMiddlewares,
  renderNonRootFolderPage,
  createFolder,
  renderFileInfo,
  renameFolder,
  removeFolder,
  removeFile,
  renameFile,
} from "../controllers/index.js";

const router = Router();

router.get("/", renderIndex);
router.get("/favicon.ico", (req, res) => {
  return res.status(200).end();
});
router.get("/:id", renderNonRootFolderPage);

router.post("/files", fileUploadMiddlewares);
router.get("/files/:id", renderFileInfo);
router.delete("/files/:id", removeFile);
router.patch("/files/:id", renameFile);

router.post("/", createFolder);
router.patch("/:id", renameFolder);
router.patch("/", renameFolder);
router.delete("/:id", removeFolder);

export default router;
