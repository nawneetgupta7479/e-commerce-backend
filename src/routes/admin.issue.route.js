import { Router } from "express";
import {
  getAllIssues,
  getIssueById,
  markIssueResolved,
} from "../controllers/issue.controller.js";

import { adminOnly, protectRoute } from "../middleware/auth.middleware.js";
const router = Router();


router.use(protectRoute, adminOnly);

// Admin routes
router.get("/", getAllIssues);
router.get("/:issueId", getIssueById);
router.patch("/:issueId/resolve", markIssueResolved);

export default router;