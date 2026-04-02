import React from "react";
import { motion } from "framer-motion";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Step3Report = ({ report }) => {
  // =========================================
  // 🔥 LOADING STATE
  // =========================================
  if (!report) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading Report... ⏳
      </div>
    );
  }

  // =========================================
  // 🔥 DATA EXTRACT (FIXED)
  // =========================================
  const {
    finalScore = 0,
    averageCommunication: communication = 0,
    averageConfidence: confidence = 0,
    averageCorrectness: correctness = 0,
    questionWise: questions = [],
  } = report;

  // =========================================
  // 🔥 CIRCULAR PROGRESS %
  // =========================================
  const percentage = (finalScore / 10) * 100;

  // =========================================
  // 🔥 PERFORMANCE TEXT
  // =========================================
  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Excellent Performance! 🚀";
    shortTagline = "You are interview ready";
  } else if (finalScore >= 5) {
    performanceText = "Good Effort 👍";
    shortTagline = "Some improvements needed";
  } else {
    performanceText = "Significant improvement required ⚡";
    shortTagline = "Work on clarity and confidence";
  }

  // =========================================
  // 🔥 GRAPH DATA
  // =========================================
  const qstnScoreData = questions.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score || 0,
  }));

  // =========================================
  // 🔥 SKILLS DATA
  // =========================================
  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  // =========================================
  // 🔥 PDF DOWNLOAD
  // =========================================
  const downloadPDF = () => {
    const doc = new jsPDF();

    let advice = "";

    if (finalScore >= 8) {
      advice =
        "Excellent performance. You demonstrated strong technical knowledge and communication skills.";
    } else if (finalScore >= 5) {
      advice =
        "Good effort. Focus on improving clarity, confidence, and structured answers.";
    } else {
      advice =
        "Improvement required. Practice structured answers and work on confidence.";
    }

    doc.setFontSize(18);
    doc.setTextColor(34, 197, 94);
    doc.text("AI Interview Performance Report", 105, 20, {
      align: "center",
    });

    doc.setDrawColor(34, 197, 94);
    doc.line(20, 25, 190, 25);

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(20, 35, 170, 15, 3, 3, "F");

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Final Score: ${finalScore}/10`, 105, 45, {
      align: "center",
    });

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, 60, 170, 25, 3, 3, "F");

    doc.setFontSize(11);
    doc.text(`Confidence: ${confidence}/10`, 25, 70);
    doc.text(`Communication: ${communication}/10`, 25, 76);
    doc.text(`Correctness: ${correctness}/10`, 25, 82);

    doc.setDrawColor(200);
    doc.roundedRect(20, 95, 170, 30, 3, 3);

    doc.setFontSize(12);
    doc.text("Professional Advice", 25, 105);

    doc.setFontSize(10);
    const splitAdvice = doc.splitTextToSize(advice, 160);
    doc.text(splitAdvice, 25, 112);

    const tableData = questions.map((q, index) => [
      index + 1,
      q.question || "N/A",
      `${q.score || 0}/10`,
      q.feedback || "No feedback",
    ]);

    autoTable(doc, {
      startY: 135,
      head: [["#", "Question", "Score", "Feedback"]],
      body: tableData,
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
      },
      styles: {
        fontSize: 8,
        cellWidth: "wrap",
      },
      columnStyles: {
        1: { cellWidth: 70 },
        3: { cellWidth: 60 },
      },
    });

    doc.save("AI_Interview_Report.pdf");
  };

  // =========================================
  // 🎨 UI
  // =========================================
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">
            Interview Analytics Dashboard 📊
          </h1>

          <button
            onClick={downloadPDF}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            Download PDF 📄
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* LEFT SIDE */}
          <div className="md:col-span-1 space-y-4">
            {/* OVERALL PERFORMANCE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-xl shadow"
            >
              <p className="text-center text-sm text-gray-500 mb-3">
                Overall Performance
              </p>

              <div className="w-32 mx-auto">
                <CircularProgressbar
                  value={percentage}
                  text={`${finalScore}/10`}
                  styles={buildStyles({
                    pathColor: "#22c55e",
                    textColor: "#000",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>

              <p className="text-center mt-4 font-semibold">
                {performanceText}
              </p>

              <p className="text-center text-sm text-gray-500">
                {shortTagline}
              </p>
            </motion.div>

            {/* SKILLS */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-xl shadow"
            >
              <h2 className="font-semibold mb-4">Skill Evaluation</h2>

              {skills.map((s, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.label}</span>
                    <span>{s.value}/10</span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${s.value * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT SIDE */}
          <div className="md:col-span-2 space-y-4">
            {/* GRAPH */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-xl shadow"
            >
              <h2 className="font-semibold mb-4">Performance Trend 📈</h2>

              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={qstnScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#22c55e"
                      fill="#bbf7d0"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* QUESTION BREAKDOWN */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-xl shadow"
            >
              <h2 className="font-semibold mb-4">
                Question Breakdown 📝
              </h2>

              <div className="space-y-4">
                {questions.length > 0 ? (
                  questions.map((q, index) => (
                    <div
                      key={index}
                      className="border p-4 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex justify-between mb-2">
                        <p className="font-medium">
                          Question {index + 1}
                        </p>

                        <p className="text-green-600 font-semibold">
                          {q.score || 0}/10
                        </p>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {q.question}
                      </p>

                      <p className="text-sm text-gray-500">
                        <strong>AI Feedback:</strong>{" "}
                        {q.feedback || "No available feedback"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">
                    No questions found 😕
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Report;