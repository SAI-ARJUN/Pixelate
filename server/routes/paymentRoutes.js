import express from "express";
import { createOrder, verifyPayment, getPlans } from "../controllers/paymentController.js";
import userAuth from "../middlewares/auth.js";

const router = express.Router();

// Route to get all available plans (no auth required)
router.get("/plans", getPlans);

// Routes that require user authentication
router.post("/create-order", userAuth, createOrder);
router.post("/verify", userAuth, verifyPayment);

export default router;
