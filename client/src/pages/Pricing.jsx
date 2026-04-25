import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { ServerUrl } from "../App.jsx";
import { useDispatch } from "react-redux";
import { updateCredits } from "../redux/userSlice.js";

const Pricing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // 🔥 plans data
  const plans = [
    {
      id: 1,
      name: "Free",
      price: 0,
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
    },
    {
      id: 2,
      name: "Starter Pack",
      price: 100,
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: 3,
      name: "Pro Pack",
      price: 500,
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);

      // 🆓 FREE PLAN: no Razorpay, just add credits directly
      if (plan.price === 0) {
        const res = await fetch(`${ServerUrl}/api/payment/free-credits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ planId: String(plan.id), credit: plan.credits }),
        });
        const data = await res.json();
        if (data.success) {
          dispatch(updateCredits(data.credits)); // ✅ update Redux store immediately
          alert(`Free credits added! Your new balance: ${data.credits} credits 🎉`);
          navigate("/");
        } else {
          alert(data.message || "Failed to add free credits");
        }
        setLoadingPlan(null);
        return;
      }

      // 🔥 PAID PLAN: Step 1 — create Razorpay order
      const res = await fetch(`${ServerUrl}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId: String(plan.id),
          amount: plan.price,
          credit: plan.credits,
        }),
      });

      const data = await res.json();
      console.log("Order Data:", data);

      if (!data.success) {
        alert(data.message || "Order creation failed. Please try again.");
        setLoadingPlan(null);
        return;
      }

      const { order } = data;

      // 🔥 Step 2: open Razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} — ${plan.credits} Credits`,
        order_id: order.id,

        handler: async function (response) {
          console.log("Razorpay Success:", response);

          // 🔥 Step 3: verify on backend
          const verifyRes = await fetch(`${ServerUrl}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            dispatch(updateCredits(verifyData.credits)); // ✅ update Redux store immediately
            alert(`Payment Successful 🎉 Your credits have been added!`);
            navigate("/");
          } else {
            alert(verifyData.message || "Payment verification failed ❌");
          }
          setLoadingPlan(null);
        },

        modal: {
          // reset loading if user closes modal
          ondismiss: () => setLoadingPlan(null),
        },

        theme: { color: "#10b981" },
      };

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-100 px-4 py-8">

      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 text-gray-700 hover:text-black"
      >
        <FaArrowLeft />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* 🔥 HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Choose Your Plan
        </h1>
        <p className="text-gray-500 mt-2">
          Flexible pricing to match your interview preparation goals.
        </p>
      </div>

      {/* 🔥 PLANS */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isLoading = loadingPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              whileHover={{ scale: 1.03 }}
              className={`cursor-pointer rounded-2xl p-6 shadow-md transition border-2
                ${isSelected ? "border-green-500 bg-white" : "border-transparent bg-white"}
              `}
            >
              {/* PLAN NAME */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">{plan.name}</h2>

                {plan.name === "Pro Pack" && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    Best Value
                  </span>
                )}
                {plan.price === 0 && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    Free
                  </span>
                )}
              </div>

              {/* PRICE */}
              <p className="text-2xl font-bold text-green-600">
                {plan.price === 0 ? "Free" : `₹${plan.price}`}
              </p>

              <p className="text-sm text-gray-500 mb-3">
                {plan.credits} Credits
              </p>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-500 mb-4">
                {plan.description}
              </p>

              {/* FEATURES */}
              <div className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA BUTTON — always triggers payment directly, no double-click */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment(plan);
                }}
                disabled={isLoading}
                className={`w-full py-2 rounded-lg font-medium transition
                  ${
                    isLoading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600 active:scale-95"
                  }
                `}
              >
                {isLoading
                  ? "Processing..."
                  : plan.price === 0
                  ? "Get Free Credits"
                  : "Buy Now 💳"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;