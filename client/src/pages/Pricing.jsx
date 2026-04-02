import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { ServerUrl } from "../App.jsx";
const Pricing = () => {
  const navigate = useNavigate();
const [loadingPlan, setLoadingPlan] = useState(null);
  // 🔥 selected plan state
  const [selectedPlan, setSelectedPlan] = useState(1);

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

    // 🔥 Step 1: create order from backend
    const res = await fetch(`${ServerUrl}/api/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        planId: plan.id,
        amount: plan.price,
        credit: plan.credits,
      }),
    });

    const data = await res.json();
    console.log("Order Data:", data);

    if (!data.success) {
      alert("Order creation failed");
      setLoadingPlan(null);
      return;
    }

    const { order } = data;

    // 🔥 Step 2: Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // frontend key
      amount: order.amount,
      currency: "INR",
      name: "AI Interview Platform",
      description: `${plan.name} - Plan ${plan.id}`,
      order_id: order.id,

      handler: async function (response) {
        console.log("Payment Success:", response);

        // 🔥 Step 3: verify payment
        const verifyRes = await fetch(`${ServerUrl}/api/payment/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          alert("Payment Successful 🎉");
          navigate("/");
        } else {
          alert("Verification Failed ❌");
        }
      },

      theme: {
        color: "#10b981", // green theme
      },
    };

    // 🔥 Step 4: open Razorpay
    const razor = new window.Razorpay(options);
    razor.open();

  } catch (error) {
    console.error("Payment Error:", error);
  } finally {
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

          return (
            <motion.div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              whileHover={{ scale: 1.05 }}
              className={`cursor-pointer rounded-2xl p-6 shadow-md transition border
                ${isSelected ? "border-green-500 bg-white" : "bg-white"}
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
              </div>

              {/* PRICE */}
              <p className="text-2xl font-bold text-green-600">
                ₹{plan.price}
              </p>

              <p className="text-sm text-gray-500 mb-3">
                {plan.credits} Credits
              </p>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-500 mb-4">
                {plan.description}
              </p>

              {/* FEATURES */}
              <div className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* SELECT BUTTON */}
       <button
  onClick={(e) => {
    e.stopPropagation();

    if (!isSelected) {
      setSelectedPlan(plan.id);
    } else {
      handlePayment(plan);
    }
  }}
  disabled={loadingPlan === plan.id}
  className={`w-full py-2 rounded-lg font-medium transition
    ${
      loadingPlan === plan.id
        ? "bg-gray-400 text-white cursor-not-allowed"
        : isSelected
        ? "bg-green-500 text-white hover:bg-green-600"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }
  `}
>
  {loadingPlan === plan.id
    ? "Processing..."
    : isSelected
    ? "Proceed to Pay"
    : "Select Plan"}
</button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;