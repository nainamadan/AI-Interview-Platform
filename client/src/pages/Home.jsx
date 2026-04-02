


import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { BsRobot, BsMic, BsClock, BsBarChart, BsFileEarmarkText } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import AuthModal from "../components/AuthModal.jsx";
import Footer from "../components/Footer.jsx";

// images
import evalImg from "../assets/ai-ans.png"
import hrImg from "../assets/HR.png"
import techImg from "../assets/tech.png"
import confidenceImg from "../assets/confi.png"
import creditImg from "../assets/credit.png"
import resumeImg from "../assets/resume.png"

import pdfImg from "../assets/pdf.png"
import analyticsImg from "../assets/history.png"

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [showAuth, setshowAuth] = useState(false);

  // 🔥 NEW ARRAY
  const advancedFeatures = [
    {
      img: evalImg,
      icon: <BsBarChart />,
      title: "AI Answer Evaluation",
      desc: "Get deep insights and scoring for every answer using advanced AI models.",
    },
    {
      img: resumeImg,
      icon: <BsFileEarmarkText />,
      title: "Resume Analysis",
      desc: "Upload your resume and get personalized interview questions instantly.",
    },
    {
      img: pdfImg,
      icon: <BsFileEarmarkText />,
      title: "PDF Report Generation",
      desc: "Download detailed interview reports in PDF format.",
    },
    {
      img: analyticsImg,
      icon: <BsBarChart />,
      title: "Performance Analytics",
      desc: "Track your progress with detailed analytics and improvement tips.",
    },
  ];

const featuresData = [
  {
    img: hrImg,
    title: "HR Interview Practice",
    desc: "Prepare for common HR questions and improve your communication and confidence with AI-driven mock interviews.",
  },
  {
    img: techImg,
    title: "Technical Interview Prep",
    desc: "Practice coding and technical questions tailored to your chosen role and skill level.",
  },
  {
    img: confidenceImg,
    title: "Confidence Building",
    desc: "Boost your confidence with real-time feedback and repeated practice sessions.",
  },
  {
    img: creditImg,
    title: "Credit-Based System",
    desc: "Use credits to access interviews, track usage, and unlock premium features easily.",
  },
];
  return (
    <div>
      <Navbar />

      {/* HERO */}
      <div className="flex flex-col items-center text-center px-6 py-16 bg-gray-50 min-h-[80vh]">
        <div className="flex items-center gap-2 bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-medium">
          <HiSparkles />
          AI Powered Smart Interview Platform
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold mt-6 text-gray-900">
          Practice Interviews with
        </h1>

        <h1 className="text-3xl sm:text-5xl font-bold mt-2 text-green-500 animate-pulse">
          AI Intelligence
        </h1>

        <p className="text-gray-600 mt-6 max-w-xl">
          Prepare smarter with our AI-driven interview system.
        </p>

        <div className="flex gap-4 mt-8 flex-wrap justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => (!user ? navigate("/auth") : navigate("/interview"))}
            className="bg-black text-white px-6 py-3 rounded-full"
          >
            Start Interview
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/history")}
            className="border px-6 py-3 rounded-full"
          >
            View History
          </motion.button>
        </div>
      </div>

      {/* OLD CARDS */}
      <div className="mt-25 flex justify-center px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {[
  {
    icon: <BsRobot />,
    step: "STEP 1",
    title: "Role & Experience Selection",
    desc: "AI adjusts difficulty based on selected job role.",
  },
  {
    icon: <BsMic />,
    step: "STEP 2",
    title: "Smart Voice Interview",
    desc: "Dynamic follow-up questions based on your answers.",
  },
  {
    icon: <BsClock />,
    step: "STEP 3",
    title: "Timer Based Simulation",
    desc: "Real interview pressure with time tracking.",
  },
].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60, rotate: index === 0 ? -6 : 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, rotate: 0 }}
              className="w-full mx-auto bg-white/90 backdrop-blur-md border border-green-200 hover:border-2 hover:border-green-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 ease-in-out"
            >
              <div className="text-2xl text-green-500">{item.icon}</div>
              <h3 className="font-bold mt-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🔥 NEW HEADING */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center text-2xl sm:text-4xl font-bold mt-20 mb-10 text-green-500 animate-pulse"
      >
        Advanced AI Capabilities
      </motion.h2>

     <div className="flex justify-center px-4 pb-20">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full">

    {advancedFeatures.map((item, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="flex items-center gap-4 bg-white rounded-2xl shadow-lg p-5 min-h-[140px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      >
        {/* LEFT IMAGE */}
       

        {/* RIGHT TEXT */}
        <div>
          <div className="text-green-500 text-xl mb-1">
            {item.icon}
          </div>

          <h3 className="font-bold text-lg text-gray-800">
            {item.title}
          </h3>

          <p className="text-sm text-gray-600">
            {item.desc}
          </p>
        </div>
         <div className="w-32 h-24 flex-shrink-0">
          <img
            src={item.img}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>
    ))}

  </div>
</div>




<div>
  <motion.h2
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{
    type: "spring",
    stiffness: 80,
    damping: 12,
  }}
  viewport={{ once: true }}
  className="text-center text-2xl sm:text-4xl font-bold mt-20 mb-10 text-green-500"
>
  Multiple Interview Modes
</motion.h2>
      <div className="flex justify-center px-4 pb-20">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full">

    {featuresData.map((item, index) => (
      <motion.div
        key={index}
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.95,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        whileHover={{
          scale: 1.04,
          y: -8,
        }}
        transition={{
          duration: 0.5,
          delay: index * 0.12,
          ease: "easeOut",
        }}
        viewport={{ once: true }}
        className="flex items-center gap-4 bg-white rounded-2xl shadow-lg p-5 min-h-[140px] hover:shadow-2xl transition-all duration-300"
      >
        
        {/* LEFT IMAGE */}
        <div className="w-32 h-24 flex-shrink-0">
          <img
            src={item.img}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* RIGHT TEXT */}
        <div>
          <h3 className="font-bold text-lg text-gray-800">
            {item.title}
          </h3>

          <p className="text-sm text-gray-600">
            {item.desc}
          </p>
        </div>

      </motion.div>
    ))}

  </div>
</div>
</div>
{/* footer
 */}
<Footer/>
      {showAuth && <AuthModal onClose={() => setshowAuth(false)} />}
    </div>
  );
};

export default Home;