import { Router } from "express";
import { authMiddleware, requirePrimaryAdmin } from "../middleware/authMiddleware.js";
import {
  getAdmins,
  createAdmin,
  changeAdminPassword,
  deleteAdmin,
} from "../controllers/adminController.js";

const router = Router();

router.use(authMiddleware, requirePrimaryAdmin);
router.get("/users", getAdmins);
router.post("/users", createAdmin);
router.put("/users/:id/password", changeAdminPassword);
router.delete("/users/:id", deleteAdmin);

export default router;
