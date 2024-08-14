import { Router } from "express";
import { createFolder } from "../controllers/folder.js";

const router = Router();

router.post("/", createFolder);

export default router;
