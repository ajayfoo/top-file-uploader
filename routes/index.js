import { Router } from "express";
import { renderIndex, fileUploadMiddlewares } from "../controllers/index.js";

const router = Router();

router.get("/", renderIndex);

router.post("/file", fileUploadMiddlewares);

export default router;
