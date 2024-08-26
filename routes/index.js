import { Router } from "express";
import {
  createFolder,
  renameFolder,
  removeFolder,
  createSharedUrl,
  renderFolderPage,
} from "../controllers/index.js";

const router = Router();

router.get("/", renderFolderPage);
router.get("/favicon.ico", (req, res) => {
  return res.status(200).end();
});
router.get("/folders/:id", renderFolderPage);

router.post("/folders/:id", createFolder);
router.post("/folders", createFolder);

router.put("/sharedUrls", createSharedUrl);

router.patch("/:id", renameFolder);
router.patch("/", renameFolder);
router.delete("/:id", removeFolder);

export default router;
