import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { updateCredits } from "../redux/userSlice";
import { motion } from "framer-motion";
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
} from "react-icons/fa";

import { ServerUrl } from "../App.jsx";

const Step1SetUp = ({ onStart }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [mode, setMode] = useState("HR");
 const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  // 🔥 auto-filled states
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");

  // 🔥 left side features
  const features = [
    { icon: <FaUserTie />, text: "Choose Role & Experience" },
    { icon: <FaMicrophoneAlt />, text: "Smart Voice Interview" },
    { icon: <FaChartLine />, text: "Performance Analytics" },
  ];

  // 🔥 Analyze Resume
  const handleUploadResume = async (e) => {
    e.stopPropagation();

    if (!file) return alert("Upload resume first");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);

      const token = localStorage.getItem("token"); // 🔑 get JWT token

const res = await axios.post(
  `${ServerUrl}/api/interview/resume`,
  formData,
    
  {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // 🔑 include JWT
    },
    withCredentials:true,
  }
);

      console.log("🔥 Backend Data:", res.data);

      // 🔥 auto-fill inputs
      setRole(res.data.role || "");
      setExperience(res.data.experience || "");

      setProjects(res.data.projects || []);
      setSkills(res.data.skills || []);
      setResumeText(res.data.resumeText || "");

      setAnalysisDone(true);

    } catch (err) {
      console.error("Resume Analysis Error:", err);
  alert(err.response?.data?.error || "Analysis failed, please try again.");
    } finally {
      setLoading(false);
    }
  };


// 🔥 Start Interview
const handleStart = async () => {
  try {
    setLoading(true);

    const data = {
      role,
      experience,
      mode,          // ✅ REQUIRED
      projects,
      skills,
      resumeText,
    };

    // ✅ Correct API endpoint
    const result = await axios.post(
      `${ServerUrl}/api/interview/generate-questions`,
      data,
      { withCredentials: true }
    );

    console.log(result.data);

    // 🔹 Update user credits in redux (example)
    if (user) {
     dispatch(updateCredits(result.data.creditsLeft));
    }
setLoading(false);
    // 🔹 Pass data to next screen (questions + interviewId)
    onStart(result.data);

  } catch (error) {
    console.error(error);

    alert(
      error?.response?.data?.message || "Something went wrong"
    );

  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg grid md:grid-cols-2 overflow-hidden">

        {/* 🔥 LEFT SIDE */}
        <motion.div
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-green-100 p-8 flex flex-col justify-center"
        >
          <h2 className="text-2xl font-bold mb-4">
            Start Your AI Interview
          </h2>

          <p className="text-gray-600 mb-6">
            Practice real interview scenarios powered by AI.
          </p>

          <div className="space-y-3">
            {features.map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
              >
                <span className="text-green-500">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 🔥 RIGHT SIDE */}
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="p-8"
        >
          <h2 className="text-xl font-bold mb-4">
            Interview Setup
          </h2>

          {/* 🔥 Role Input (auto-filled) */}
          <div className="flex items-center border rounded-lg px-3 mb-3 focus-within:border-green-500">
            <FaUserTie className="text-gray-400 mr-2" />
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Enter role"
              className="w-full p-2 outline-none"
            />
          </div>

          {/* 🔥 Experience Input (auto-filled) */}
          <div className="flex items-center border rounded-lg px-3 mb-3 focus-within:border-green-500">
            <FaBriefcase className="text-gray-400 mr-2" />
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Experience"
              className="w-full p-2 outline-none"
            />
          </div>
<select
  value={mode}
  onChange={(e) => setMode(e.target.value)}
  className="w-full p-2 border rounded-lg mb-3"
>
  <option value="HR">HR Interview</option>
  <option value="TECHNICAL">Technical Interview</option>
</select>
          {/* 🔥 Upload Box */}
          <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-green-400 mb-4">
            <FaFileUpload className="text-green-500 text-2xl mb-2" />

            {file ? (
              <p className="text-sm">{file.name}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Click to upload resume
              </p>
            )}
<input
  type="file"
  accept="application/pdf"
  onChange={(e) => {
    const selectedFile = e.target.files[0];

    // 🔹 File size check (<5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return; // file select ignore ho jayega
    }

    setFile(selectedFile);
  }}
  className="hidden"
/>

            {/* 🔥 Analyze Button */}
            {file && (
             <button
  onClick={handleUploadResume}
  disabled={loading}
  className={`mt-3 px-4 py-1 rounded-full text-sm ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 text-white"}`}
>
  {loading ? "Analyzing..." : "Analyze Resume"}
</button>
            )}
          </label>

          {/* 🔥 Show Extracted Data */}
  {analysisDone && (
  <div className="mb-4 p-4 bg-gray-50 rounded-xl shadow-sm">
    
    <h3 className="font-semibold mb-2 text-gray-700">
      Resume Analysis Result
    </h3>

    {/* 🔹 Projects */}
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-600 mb-1">Projects:</p>
      <ul className="list-disc list-inside text-sm text-gray-700">
        {projects.length ? (
          projects.map((proj, i) => <li key={i}>{proj}</li>)
        ) : (
          <li>No projects detected</li>
        )}
      </ul>
    </div>

    {/* 🔹 Skills */}
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">Skills:</p>
      <div className="flex flex-wrap gap-2">
        {skills.length ? (
          skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-500">No skills detected</span>
        )}
      </div>
    </div>

  </div>
)}

          {/* 🔥 Start Button */}
          <button
            onClick={handleStart}
            disabled={!role ||!experience ||loading
            }
            className="w-full bg-black text-white py-3 rounded-full"
          >
            {loading?"Starting":"Start Interview"}
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Step1SetUp;