import { Router } from "express";
import {
  renderIndex,
  fileUploadMiddlewares,
  renderNonRootFolderPage,
  createFolder,
} from "../controllers/index.js";

const router = Router();

router.get("/", renderIndex);
router.get("/:id", renderNonRootFolderPage);

router.post("/files", fileUploadMiddlewares);
router.post("/folders", createFolder);

export default router;
