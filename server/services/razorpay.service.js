// import Razorpay from "razorpay";
// import crypto from "crypto";

// // 🔥 init razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // =========================================
// // 🔥 CREATE ORDER
// // =========================================
// export const createOrder = async (amount, currency = "INR") => {
//   try {
//     const options = {
//       amount: amount * 100, // 🔥 paise me convert
//       currency,
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     return order;

//   } catch (error) {
//     console.error("Razorpay Order Error:", error);
//     throw error;
//   }
// };

// // =========================================
// // 🔥 VERIFY PAYMENT (CRYPTO)
// // =========================================
// export const verifyPayment = ({
//   razorpay_order_id,
//   razorpay_payment_id,
//   razorpay_signature,
// }) => {
//   try {
//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     return expectedSignature === razorpay_signature;

//   } catch (error) {
//     console.error("Verification Error:", error);
//     return false;
//   }
// };