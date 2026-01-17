import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createIssue } from "../controllers/issue.controller.js";

const router = Router();

// User can only create issues
router.post("/", protectRoute, createIssue);

export default router;