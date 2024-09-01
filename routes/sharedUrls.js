import { Router } from "express";
import {
  upsertSharedUrl as upsertSharedFolderUrl,
  deleteSharedUrl as deleteSharedFolderUrl,
} from "../controllers/index.js";
import {
  deleteSharedUrl as deleteSharedFileUrl,
  upsertSharedUrl as upsertSharedFileUrl,
} from "../controllers/files.js";

const router = Router();

router.put("/sharedFolderUrls", upsertSharedFolderUrl);
router.delete("/sharedFolderUrls", deleteSharedFolderUrl);

router.put("/sharedFileUrls", upsertSharedFileUrl);
router.delete("/sharedFileUrls", deleteSharedFileUrl);

export default router;
