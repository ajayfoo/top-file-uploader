import { Router } from "express";
import {
  upsertSharedFolderUrl,
  deleteSharedFolderUrl,
  upsertSharedFileUrl,
  deleteSharedFileUrl,
} from "../controllers/sharedUrls.js";

const router = Router();

router.put("/sharedFolderUrls", upsertSharedFolderUrl);
router.delete("/sharedFolderUrls", deleteSharedFolderUrl);

router.put("/sharedFileUrls", upsertSharedFileUrl);
router.delete("/sharedFileUrls", deleteSharedFileUrl);

export default router;
