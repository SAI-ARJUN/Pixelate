import Razorpay from "razorpay";
import crypto from "crypto";
import transactionModel from "../models/transactionModel.js";
import userModel from "../models/userModel.js";

// ---- Razorpay Plans ----
const plans = [
  { id: "basic", price: 100, credits: 10, desc: "Basic plan with 10 credits" },
  { id: "standard", price: 199, credits: 25, desc: "Standard plan with 25 credits" },
  { id: "advanced", price: 500, credits: 100, desc: "Advanced plan with 100 credits" },
  { id: "business", price: 750, credits: 1000, desc: "Business plan with 1000 credits" },
];

// ---- Get Plans API ----
export const getPlans = (req, res) => {
  try {
    return res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error("❌ Get Plans Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load plans" });
  }
};

// ---- Create Razorpay Order ----
export const createOrder = async (req, res) => {
  try {
    console.log("[Payment] Create Order API Hit");

    const { planId } = req.body;
    const selectedPlan = plans.find(p => p.id.toLowerCase() === planId.toLowerCase());

    if (!selectedPlan) {
      console.error("Invalid Plan ID:", planId);
      return res.status(400).json({ success: false, message: "Invalid plan ID" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: selectedPlan.price * 100,  // Amount in paise
      currency: process.env.CURRENCY || "INR",
      receipt: `receipt_${Date.now()}`,
    });

    await new transactionModel({
      userId: req.user._id,
      plan: selectedPlan.id,
      amount: selectedPlan.price,
      credits: selectedPlan.credits,
      payment: false,
      date: Date.now(),
      razorpay_order_id: order.id
    }).save();

    console.log("Order Created Successfully:", order.id);
    return res.status(200).json({ success: true, order });

  } catch (error) {
    console.error("❌ Order Creation Error:", error);
    return res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// ---- Verify Razorpay Payment ----
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const transaction = await transactionModel.findOneAndUpdate(
      { razorpay_order_id },
      { payment: true },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    await userModel.findByIdAndUpdate(transaction.userId, {
      $inc: { creditBalance: transaction.credits }
    });

    console.log("Payment Verified & Credits Updated for User:", transaction.userId);
    return res.status(200).json({ success: true, message: "Payment verified & credits added" });

  } catch (error) {
    console.error("❌ Payment Verification Error:", error);
    return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};
