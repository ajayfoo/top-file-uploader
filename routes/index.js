import { Router } from "express";
import {
  renderIndex,
  fileUploadMiddlewares,
  renderNonRootFolderPage,
} from "../controllers/index.js";

const router = Router();

router.get("/", renderIndex);
router.get("/:id", renderNonRootFolderPage);

router.post("/files", fileUploadMiddlewares);

export default router;
