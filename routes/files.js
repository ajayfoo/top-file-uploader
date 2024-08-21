import { Router } from "express";
import {
  fileUploadMiddlewares,
  renderFileInfo,
  removeFile,
  renameFile,
} from "../controllers/files.js";

const router = Router();
router.post("/", fileUploadMiddlewares);
router.get("/:id", renderFileInfo);
router.delete("/:id", removeFile);
router.patch("/:id", renameFile);

export default router;
