import { Router } from "express";
import { createSharedUrl } from "../controllers/index.js";
import { upsertSharedUrl } from "../controllers/files.js";

const router = Router();
router.put("/sharedFolderUrls/:id", createSharedUrl);
router.put("/sharedFolderUrls", createSharedUrl);

router.post("/sharedFileUrls", upsertSharedUrl);

export default router;
