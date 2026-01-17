import { Router } from "express";
import { protectAdminRoute } from "../middleware/auth.middleware.js";
import {
  getAllIssues,
  getIssueById,
  markIssueResolved,
} from "../controllers/issue.controller.js";

const router = Router();

router.use(protectAdminRoute);

// Admin routes
router.get("/", getAllIssues);
router.get("/:issueId", getIssueById);
router.patch("/:issueId/resolve", markIssueResolved);

export default router;