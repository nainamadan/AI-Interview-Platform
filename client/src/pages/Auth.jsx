import { BsRobot } from "react-icons/bs";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoSparkles } from "react-icons/io5";
import { motion } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { ServerUrl } from "../App.jsx";
import { setUser } from "../redux/userSlice.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Auth = ({isModel=false}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const [loading, setLoading] = useState(false);
  const handleGoogleAuth = async () => {
      if (loading) return; // 🚫 prevent multiple calls
  setLoading(true);
    try {
      const response = await signInWithPopup(auth, provider);

      const User = response.user;
      const name = User.displayName;
      const email = User.email;

      // 🔥 send to backend
      await axios.post(
        `${ServerUrl}/api/auth/google`,
        { name, email },
        { withCredentials: true }
      );

      // 🔥 get current user from backend
      const res = await axios.get(
        `${ServerUrl}/api/user/current-user`,
        { withCredentials: true }
      );

      console.log("User:", res.data.user);

      // 🔥 store ONLY user
      dispatch(setUser(res.data.user));

      // 🔥 redirect to home
      navigate("/");

    } catch (error) {
     if (error.code !== "auth/cancelled-popup-request") {
      console.log(error);
    }
      // ❌ FIXED
      dispatch(setUser(null));
    }
     finally {
    setLoading(false);
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-black p-2 rounded-md">
            <BsRobot className="text-white text-lg" />
          </div>
          <h1 className="font-semibold text-gray-800 text-lg">
            InterviewIQ.AI
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Continue with
        </h2>

        {/* Tag */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
            <IoSparkles />
            AI Smart Interview
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm mt-4 leading-relaxed px-2">
          Sign in to start AI-powered mock interviews, track your progress,
          and unlock deeper insights to improve your performance.
        </p>

        {/* Button */}
        <motion.button
          onClick={handleGoogleAuth}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-black text-white py-3 rounded-full font-medium shadow-md hover:shadow-lg transition"
        >
          <FcGoogle className="text-lg bg-white rounded-full" />
         {loading?"continuing": "Continue with Google"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Auth;