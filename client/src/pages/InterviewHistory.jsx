import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { ServerUrl } from "../App.jsx";

const InterviewHistory = () => {

  // 🔥 STATE
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  // =========================================
  // 🔥 FETCH INTERVIEWS (API CALL)
  // =========================================
  useEffect(() => {

    const getMyInterviews = async () => {
      try {
        // 🔹 API call
        const res = await axios.get(
          `${ServerUrl}/api/interview/get-interview`,
          { withCredentials: true }
        );

        // 🔹 data state me store
        setInterviews(res.data.interviews);

      } catch (error) {
        console.log("Error fetching interviews", error);
      }
    };

    getMyInterviews();

  }, []);

  // =========================================
  // 🔥 DATE FORMAT FUNCTION
  // =========================================
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // =========================================
  // 🎨 UI
  // =========================================
  return (
    <div className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-4xl mx-auto">

        {/* 🔙 BACK BUTTON + HEADING */}
        <div className="flex items-center gap-3 mb-4">
          <FaArrowLeft
            className="cursor-pointer"
            onClick={() => navigate("/")}
          />
          <h1 className="text-xl font-bold">
            Interview History
          </h1>
        </div>

        {/* 🔹 SUBTEXT */}
        <p className="text-gray-500 mb-6">
          Track your past interviews and performance reports
        </p>

        {/* ========================================= */}
        {/* 🔥 INTERVIEW LIST */}
        {/* ========================================= */}

        {interviews.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No interviews found</p>
            <p className="text-sm">
              Start your first interview 🚀
            </p>
          </div>
        ) : (

          <div className="space-y-4">

            {interviews.map((item) => (

              <div
                key={item._id}
                onClick={() => navigate(`/report/${item._id}`)}
                className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition"
              >

                {/* 🔹 TOP */}
                <div className="flex justify-between items-center">

                  <div>
                    <h2 className="font-semibold capitalize">
                      {item.role}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {item.experience} • {item.mode}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  {/* 🔹 SCORE + STATUS */}
                  <div className="text-right">

                    <p className="text-green-600 font-bold">
                      {item.finalScore || 0}/10
                    </p>

                    <p className="text-xs text-gray-400">
                      Overall Score
                    </p>

                    <span
                      className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {item.status}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
};

export default InterviewHistory;