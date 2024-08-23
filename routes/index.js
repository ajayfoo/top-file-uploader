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
router.get("/:id", renderFolderPage);

router.post("/", createFolder);
router.put("/:id/sharedUrl", createSharedUrl);
router.put("/sharedUrl", createSharedUrl);
router.patch("/:id", renameFolder);
router.patch("/", renameFolder);
router.delete("/:id", removeFolder);

export default router;
