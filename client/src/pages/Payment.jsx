import React, { useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ServerUrl } from "../App.jsx";

const Payment = () => {
  const navigate = useNavigate();
  const { state: plan } = useLocation();

 useEffect(() => {
  if (!plan) {
    navigate("/pricing");
    return;
  }
}, []);

  // =========================================
  // 🔥 RAZORPAY FLOW
  // =========================================
  const initiatePayment = async () => {
    try {
      // 🔥 1. create order
      const { data } = await axios.post(
        `${ServerUrl}/api/payment/create-order`,
        {
          planId: plan.id || plan.name,
          amount: plan.price,
          credit: plan.credits,
        },
        { withCredentials: true }
      );

      const order = data.order;

      // 🔥 2. open razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // 🔑 frontend key
        amount: order.amount,
        currency: order.currency,
        name: "InterviewIQ.AI",
        description: `${plan.name} Plan`,
        order_id: order.id,

        handler: async function (response) {
          // 🔥 3. verify payment
          const verifyRes = await axios.post(
            `${ServerUrl}/api/payment/verify`,
            response,
            { withCredentials: true }
          );

          if (verifyRes.data.success) {
            alert("Payment Successful 🎉");

            navigate("/");
          } else {
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: "User",
          email: "user@email.com",
        },

        theme: {
          color: "#22c55e",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    }
  };

return (
  <div className="h-screen flex flex-col items-center justify-center gap-4">
    <p className="text-gray-500">Ready for payment</p>

    <button
      onClick={initiatePayment}
      className="bg-green-500 text-white px-6 py-3 rounded"
    >
      Pay Now 💳
    </button>
  </div>
);
};

export default Payment;