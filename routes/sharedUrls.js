import { Router } from "express";
import { createSharedUrl } from "../controllers/index.js";
import { deleteSharedUrl, upsertSharedUrl } from "../controllers/files.js";

const router = Router();
router.put("/sharedFolderUrls/:id", createSharedUrl);
router.put("/sharedFolderUrls", createSharedUrl);

router.put("/sharedFileUrls", upsertSharedUrl);
router.delete("/sharedFileUrls", deleteSharedUrl);

export default router;
