import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Step3Report from "../components/Step3Report.jsx";
import { ServerUrl } from "../App.jsx";

const InterviewReport = () => {
  // 🔥 URL se interview id
  const { id } = useParams();

  // 🔥 states
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // 🔥 FETCH REPORT
  // =========================================
  useEffect(() => {
    const getReport = async () => {
      try {
        const res = await axios.get(
          `${ServerUrl}/api/interview/report/${id}`,
          { withCredentials: true }
        );

        console.log("🔥 Report API Response:", res.data);

        // ✅ FIX: correct data extract
        setReport(res.data.report);

      } catch (error) {
        console.log("❌ Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    getReport();
  }, [id]);

  // =========================================
  // 🔥 LOADING UI
  // =========================================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading Report...
      </div>
    );
  }

  // =========================================
  // 🔥 NO DATA UI (IMPORTANT)
  // =========================================
  if (!report) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 font-bold">
        No report found
      </div>
    );
  }

  // =========================================
  // 🔥 FINAL UI
  // =========================================
  return <Step3Report report={report} />;
};

export default InterviewReport;