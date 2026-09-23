import { Router } from "express";
import {
  login,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
