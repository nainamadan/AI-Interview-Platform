import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // 🔥 USER
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 PLAN INFO
    planId: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    credits: {
      type: Number,
      required: true,
    },

    // 🔥 RAZORPAY DATA
    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    // 🔥 STATUS
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;