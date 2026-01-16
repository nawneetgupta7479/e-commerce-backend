import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createPaymentIntent, handleWebhook, getUserPayments } from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-intent", protectRoute, createPaymentIntent);

// Get user's payment history
router.get("/history", protectRoute, getUserPayments);

// No auth needed - Stripe validates via signature
router.post("/webhook", handleWebhook);

export default router;
