
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();
// 🔥 CREATE ORDER API
import Razorpay from "razorpay";
import Payment from "../models/payment.model.js"; // adjust path
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credit } = req.body;

    // ❌ Validate plan data
    if (!planId || !amount || !credit) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan data",
      });
    }

    // 🔥 Razorpay options
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    // 🔥 Create order
    const order = await razorpay.orders.create(options);

    // 💾 Save payment in DB
    const payment = await Payment.create({
       userId: req.user.id, 
      planId,
      amount,
     credits: credit,  
      razorpayOrderId: order.id,
      status: "created",
    });

    // ✅ Response
    res.status(200).json({
      success: true,
      order
      
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const verifyPaymentController = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ❌ check required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // 🔥 Step 1: Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // 🔥 Step 2: Compare signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 🔥 Step 3: Find payment in DB
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // 🔥 Step 4: Prevent duplicate credit update
    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    // 🔥 Step 5: Update payment status
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "paid";
    await payment.save();

    // 🔥 Step 6: Add credits to user
    const user = await User.findById(req.user.id);

    user.credits += payment.credits; // ✅ use DB value
    await user.save();

    // ✅ Response
    res.status(200).json({
      success: true,
      message: "Payment successful & credits added",
      credits: user.credits,
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Verification error",
    });
  }
};