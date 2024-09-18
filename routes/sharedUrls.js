import { Router } from "express";
import {
  upsertSharedFolderUrlAndValidationMiddlewares,
  deleteSharedFolderUrlAndValidationMiddlewares,
  upsertSharedFileUrlAndValidationMiddlewares,
  deleteSharedFileUrlAndValidationMiddlewares,
} from "../controllers/sharedUrls.js";

const router = Router();

router.put("/sharedFolderUrls", upsertSharedFolderUrlAndValidationMiddlewares);
router.delete(
  "/sharedFolderUrls",
  deleteSharedFolderUrlAndValidationMiddlewares,
);

router.put("/sharedFileUrls", upsertSharedFileUrlAndValidationMiddlewares);
router.delete("/sharedFileUrls", deleteSharedFileUrlAndValidationMiddlewares);

export default router;
