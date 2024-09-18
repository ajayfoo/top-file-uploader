import { Router } from "express";
import {
  fileUploadMiddlewares,
  renderFileInfo,
  removeFile,
  getFile,
  renameFileAndValidationMiddlewares,
} from "../controllers/files.js";
import { deleteSharedFileUrlIfExpiredMiddleware } from "../middlewares/files.js";

const router = Router({ mergeParams: true });

router.all("/:id", deleteSharedFileUrlIfExpiredMiddleware);

router.post("/", fileUploadMiddlewares);
router.get("/:id", renderFileInfo);
router.delete("/:id", removeFile);
router.patch("/:id", renameFileAndValidationMiddlewares);
router.get("/:id/blob", getFile);

export default router;
