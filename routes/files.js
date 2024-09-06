import { Router } from "express";
import {
  fileUploadMiddlewares,
  renderFileInfo,
  removeFile,
  renameFile,
} from "../controllers/files.js";
import { deleteSharedFileUrlIfExpiredMiddleware } from "../middlewares/files.js";

const router = Router({ mergeParams: true });

router.all("/:id", deleteSharedFileUrlIfExpiredMiddleware);

router.post("/", fileUploadMiddlewares);
router.get("/:id", renderFileInfo);
router.delete("/:id", removeFile);
router.patch("/:id", renameFile);

export default router;
