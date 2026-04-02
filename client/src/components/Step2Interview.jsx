import React, { useEffect, useRef, useState } from "react";
import Timer from "./Timer";
import { motion } from "framer-motion";
import femalevoice from "../assets/female-ai.mp4";
import axios from "axios";
import { ServerUrl } from "../App.jsx";

const Step2Interview = ({ interviewData, onFinish }) => {

  const { questions, interviewId, username } = interviewData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const [timeLeft, setTimeLeft] = useState(
    questions?.[0]?.timeLimit || 30
  );

  const [isAIPlaying, setIsAIPlaying] = useState(true);
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false); // 🔥 NEW

  const hasStartedRef = useRef(false);

  // =========================================
  // 🔊 SPEAK
  // =========================================
  const speak = (text, callback) => {
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      setIsAIPlaying(true);
      setIsTimerRunning(false);
    };

    utterance.onend = () => {
      setIsAIPlaying(false);
      setIsTimerRunning(true);
      callback && callback();
    };

    speechSynthesis.speak(utterance);
  };

  // =========================================
  // ⏱ TIMER
  // =========================================
  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);

  }, [isTimerRunning]);

  // =========================================
  // 🚀 START
  // =========================================
  useEffect(() => {

    if (!questions?.length || hasStartedRef.current) return;

    hasStartedRef.current = true;

    speak(`Hello ${username}, let's begin`, () => {

      setIsIntroPhase(false);

      speak(questions[0].question, () => {
        setTimeLeft(questions[0]?.timeLimit || 30);
      });

    });

  }, [questions]);

  // =========================================
  // 👉 SUBMIT
  // =========================================
  const handleSubmit = async (isAuto = false) => {

    if (isFinishing) return; // 🔥 prevent double calls

    const currentAnswer = answer.trim();

    if (!currentAnswer && !isAuto) {
      alert("Please enter answer");
      return;
    }

    try {
      await axios.post(
        `${ServerUrl}/api/interview/submit-answer`,
        {
          interviewId,
          answer: currentAnswer,
          index: currentIndex,
          timeTaken:
            (questions[currentIndex]?.timeLimit || 30) - timeLeft
        },
        { withCredentials: true }
      );

      console.log("✅ Answer saved");

    } catch (err) {
      console.log("❌ Submit error", err.response?.data);
    }

    // =========================================
    // NEXT QUESTION
    // =========================================
    if (currentIndex < questions.length - 1) {

      const next = currentIndex + 1;

      speak("Next question", () => {

        setCurrentIndex(next);
        setAnswer("");

        const newTime = questions[next]?.timeLimit || 30;
        setTimeLeft(newTime);

        speak(questions[next].question);
      });

    } 
    // =========================================
    // 🔥 FINISH (MAIN FIX)
    // =========================================
    else {

      setIsFinishing(true); // 🔥 important

      try {
        const res = await axios.post(
          `${ServerUrl}/api/interview/finish`,
          { interviewId },
          { withCredentials: true }
        );

        console.log("✅ Interview completed", res.data);

        // 🔥 STOP everything before moving
        speechSynthesis.cancel();
        setIsTimerRunning(false);

        // 🔥 direct navigation (NO delay, NO speak)
        onFinish(interviewId);

      } catch (err) {
        console.log("❌ Finish error", err.response?.data);
        alert("Failed to finish interview");
        setIsFinishing(false);
      }
    }
  };

  // =========================================
  // UI
  // =========================================
  if (!questions || questions.length === 0) {
    return <div>No questions found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* 🔥 finishing loader */}
      {isFinishing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-white text-xl">
          Finishing Interview...
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg grid md:grid-cols-2 overflow-hidden">

        {/* LEFT */}
        <div className="p-4 border-r">

          <p className="text-sm text-gray-500 mb-4">
            {isIntroPhase
              ? "AI introducing..."
              : isAIPlaying
              ? "AI Speaking..."
              : "Your turn"}
          </p>

          <video
            src={femalevoice}
            autoPlay
            muted
            loop
            className="rounded-xl mb-4"
          />

          <div className="flex justify-between text-sm">
            <p>Q: {currentIndex + 1}</p>
            <p>Total: {questions.length}</p>
          </div>

          <Timer
            timeLeft={timeLeft}
            totalTime={questions[currentIndex]?.timeLimit || 30}
          />

        </div>

        {/* RIGHT */}
        <div className="p-6 flex flex-col justify-between">

          <div>
            <div className="bg-gray-100 p-4 rounded mb-4">
              {questions[currentIndex]?.question}
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isAIPlaying}
              className="w-full h-40 border p-3"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSubmit(false)}
            className="bg-green-500 text-white py-3 rounded"
          >
            Submit
          </motion.button>

        </div>

      </div>
    </div>
  );
};

export default Step2Interview;