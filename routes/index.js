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

router.post("/folders", createFolder);
router.post("/folders/:id", renameFolder);
router.patch("/folders/:id", renameFolder);
router.delete("/folders/:id", removeFolder);

export default router;
