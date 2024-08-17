import { Router } from "express";
import {
  renderIndex,
  fileUploadMiddlewares,
  renderNonRootFolderPage,
  createFolder,
  renderFileInfo,
  renameFolder,
  removeFolder,
} from "../controllers/index.js";

const router = Router();

router.get("/", renderIndex);
router.get("/favicon.ico", (req, res) => {
  return res.status(200).end();
});
router.get("/:id", renderNonRootFolderPage);

router.post("/files", fileUploadMiddlewares);
router.get("/files/:id", renderFileInfo);

router.post("/", createFolder);
router.post("/:id", renameFolder);
router.patch("/:id", renameFolder);
router.delete("/:id", removeFolder);

export default router;
