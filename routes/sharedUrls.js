import { Router } from "express";
import { createSharedUrl } from "../controllers/index.js";

const router = Router();
router.put("/sharedFolderUrls/:id", createSharedUrl);
router.put("/sharedFolderUrls", createSharedUrl);

export default router;
