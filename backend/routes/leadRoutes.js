import { Router } from "express";
import { createLead, getLeads, updateLead } from "../controllers/leadController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", createLead); // Public
router.get("/", authMiddleware, getLeads); // Protected
router.put("/:id", authMiddleware, updateLead); // Protected

export default router;
