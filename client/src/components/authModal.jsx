import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsRobot } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { IoSparkles } from "react-icons/io5";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase.js";
import axios from "axios";
import { ServerUrl } from "../App.jsx";
import { setUser } from "../redux/userSlice.js";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ onClose }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔥 Google Login
  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);

      const name = response.user.displayName;
      const email = response.user.email;

      await axios.post(
        `${ServerUrl}/api/auth/google`,
        { name, email },
        { withCredentials: true }
      );

      const res = await axios.get(
        `${ServerUrl}/api/user/current-user`,
        { withCredentials: true }
      );

      dispatch(setUser(res.data.user));

    } catch (error) {
      console.log(error);
      dispatch(setUser(null));
    }
  };

  // 🔥 auto close after login
  useEffect(() => {
    if (user) {
      onClose();
      navigate("/");
    }
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative text-center"
      >

        {/* ❌ Close */}
        <button
          onClick={() => {
            onClose();
            navigate("/");
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <FaTimes />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-black p-2 rounded-md">
            <BsRobot className="text-white text-lg" />
          </div>
          <h1 className="font-semibold text-gray-800 text-lg">
            InterviewIQ.AI
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-800">
          Continue with
        </h2>

        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
            <IoSparkles />
            AI Smart Interview
          </span>
        </div>

        <p className="text-gray-500 text-sm mt-4">
          Sign in to start AI-powered mock interviews and track your progress.
        </p>

        {/* 🔥 FIXED BUTTON */}
        <motion.button
          onClick={handleGoogleAuth}
          whileHover={{ scale: 1.05 }}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-black text-white py-3 rounded-full"
        >
          <FcGoogle className="bg-white rounded-full" />
          Continue with Google
        </motion.button>

      </motion.div>
    </div>
  );
};

export default AuthModal;