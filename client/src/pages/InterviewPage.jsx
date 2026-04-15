import React, { useState } from "react";
import axios from "axios";
import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";
import { ServerUrl } from "../App.jsx";

const InterviewPage = () => {

  // 🔥 Step control
  const [step, setStep] = useState(1);

  // 🔥 Store interview data / report
  const [interviewData, setInterviewData] = useState(null);
  const [report, setReport] = useState(null);

  // 🔥 Fetch report from API
  const fetchReport = async (interviewId) => {
    try {
      const res = await axios.get(
        `${ServerUrl}/api/interview/report/${interviewId}`,
        { withCredentials: true }
      );
      setReport(res.data.report);
      setStep(3);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      alert("Failed to load report");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      {/* STEP 1 */}
      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data);   // setup data store
            setStep(2);               // move to step 2
          }}
        />
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(interviewId) => {
            fetchReport(interviewId); // fetch report then move to step 3
          }}
        />
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <Step3Report
          report={report}
        />
      )}

    </div>
  );
};

export default InterviewPage;