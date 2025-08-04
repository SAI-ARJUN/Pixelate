import express from "express";
import crypto from "crypto";
import userAuth from "../middlewares/auth.js";
import transactionModel from "../models/transactionModel.js";
import userModel from "../models/userModel.js";

const router = express.Router();

router.post("/verify", userAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Find transaction
    const transaction = await transactionModel.findOne({ razorpay_order_id });

    if (!transaction || transaction.payment) {
      return res.status(400).json({ success: false, message: "Transaction invalid or already processed" });
    }

    // Update payment and user's credit balance
    const user = await userModel.findById(transaction.userId);
    user.creditBalance += transaction.credits;
    await user.save();

    transaction.payment = true;
    await transaction.save();

    return res.status(200).json({ success: true, message: "Payment verified", credits: user.creditBalance });
  } catch (err) {
    console.error("Payment verification error:", err);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
});

export default router;
