import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadImage } from "../controllers/mediaController.js";

const router = Router();
router.post("/upload", authMiddleware, uploadImage);
export default router;
