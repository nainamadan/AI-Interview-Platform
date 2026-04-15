import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import Timer from "./Timer";
import { motion, AnimatePresence } from "framer-motion";
import femalevoice from "../assets/female-ai.mp4";
import axios from "axios";
import { ServerUrl } from "../App.jsx";
import { getMediaStream, stopMediaStream } from "../utils/mediaAccess.js";
import { BsCameraVideoOff, BsMicFill, BsMicMuteFill } from "react-icons/bs";
import { MdOutlineWarningAmber } from "react-icons/md";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognition;

const Step2Interview = ({ interviewData, onFinish }) => {
  const { questions, interviewId, username } = interviewData;

  const [currentIndex, setCurrentIndex]     = useState(0);
  const [answer, setAnswer]                 = useState("");
  const [timeLeft, setTimeLeft]             = useState(questions?.[0]?.timeLimit || 30);
  const [isAIPlaying, setIsAIPlaying]       = useState(true);
  const [isIntroPhase, setIsIntroPhase]     = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFinishing, setIsFinishing]       = useState(false);

  const [cameraError, setCameraError]       = useState(null);
  const [isMicActive, setIsMicActive]       = useState(false);
  const [isCameraReady, setIsCameraReady]   = useState(false);

  const [isListening, setIsListening]       = useState(false);
  const [interimText, setInterimText]       = useState("");

  const [modelsLoaded, setModelsLoaded]     = useState(false);
  const [faceCount, setFaceCount]           = useState(0);
  const [warningCountdown, setWarningCountdown] = useState(null);

  const hasStartedRef     = useRef(false);
  const userVideoRef      = useRef(null);
  const streamRef         = useRef(null);
  const faceIntervalRef   = useRef(null);
  const countdownRef      = useRef(null);
  const isFinishingRef    = useRef(false);
  const recognitionRef    = useRef(null);
  const committedRef      = useRef("");   // stores confirmed speech text
  const isMicActiveRef    = useRef(false); // sync ref for mic state
  const isListeningRef    = useRef(false); // tracks if recognition is actually running

  // ─────────────────────────────────────────────────────────────
  // HELPERS: start / stop recognition explicitly
  // ─────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!speechSupported || !recognitionRef.current) return;
    if (!isMicActiveRef.current) return;        // mic is muted
    if (isListeningRef.current) return;         // already running
    if (isFinishingRef.current) return;

    try {
      committedRef.current = "";                // fresh buffer for new question
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch (e) {
      // DOMException if already started — safe to ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!speechSupported || !recognitionRef.current) return;
    if (!isListeningRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) { /* ignore */ }
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText("");
  }, []);

  // ─────────────────────────────────────────────────────────────
  // INIT SPEECH RECOGNITION INSTANCE (once)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!speechSupported) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = true;       // keep listening; don't auto-stop
    rec.interimResults = true;   // show partial words as user speaks

    rec.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };

    rec.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      setInterimText("");

      // Auto-restart if it stopped by itself (browser timeout)
      // but only if it's still supposed to be user's turn
      if (!isFinishingRef.current && isMicActiveRef.current) {
        // small delay before restart to avoid rapid loop
        setTimeout(() => {
          if (!isFinishingRef.current && isMicActiveRef.current && isListeningRef.current === false) {
            try {
              rec.start();
              isListeningRef.current = true;
              setIsListening(true);
            } catch (e) { /* already started */ }
          }
        }, 300);
      }
    };

    rec.onresult = (event) => {
      let interim   = "";
      let newFinal  = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += text + " ";
        } else {
          interim += text;
        }
      }

      if (newFinal) {
        committedRef.current += newFinal;
        setAnswer(committedRef.current.trimStart());
      }
      setInterimText(interim);
    };

    rec.onerror = (event) => {
      if (event.error === "no-speech") return;       // normal silence
      if (event.error === "aborted") return;         // we stopped it
      console.warn("SpeechRecognition error:", event.error);
    };

    recognitionRef.current = rec;

    return () => { rec.abort(); };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // SPEECH SYNTHESIS — stop mic before AI speaks, start after
  // ─────────────────────────────────────────────────────────────
  const speak = useCallback((text, callback) => {
    stopListening();              // always silence mic before AI speaks
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
      setIsAIPlaying(true);
      setIsTimerRunning(false);
    };

    utterance.onend = () => {
      setIsAIPlaying(false);
      setIsTimerRunning(true);
      callback?.();
      startListening();           // start mic as soon as AI finishes
    };

    speechSynthesis.speak(utterance);
  }, [startListening, stopListening]);

  // ─────────────────────────────────────────────────────────────
  // LOAD FACE DETECTION MODELS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    faceapi.nets.tinyFaceDetector
      .loadFromUri(MODEL_URL)
      .then(() => setModelsLoaded(true))
      .catch((e) => console.warn("Face model load failed:", e.message));
  }, []);

  // ─────────────────────────────────────────────────────────────
  // CAMERA + MIC ON MOUNT
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await getMediaStream({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (userVideoRef.current) userVideoRef.current.srcObject = stream;
        streamRef.current  = stream;
        isMicActiveRef.current = true;
        setIsCameraReady(true);
        setIsMicActive(true);
      } catch (err) {
        setCameraError(err.message);
      }
    };
    startMedia();

    return () => {
      if (streamRef.current) stopMediaStream(streamRef.current);
      clearInterval(faceIntervalRef.current);
      clearInterval(countdownRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // MIC TOGGLE
  // ─────────────────────────────────────────────────────────────
  const toggleMic = () => {
    if (!streamRef.current) return;
    const next = !isMicActiveRef.current;
    streamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
    isMicActiveRef.current = next;
    setIsMicActive(next);

    if (!next) {
      stopListening();
    }
    // if turning ON and it's user's turn — start immediately
    else if (!isAIPlaying) {
      startListening();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FORCE END INTERVIEW
  // ─────────────────────────────────────────────────────────────
  const forceEndInterview = useCallback(async () => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    setIsFinishing(true);

    clearInterval(faceIntervalRef.current);
    clearInterval(countdownRef.current);
    speechSynthesis.cancel();
    stopListening();
    recognitionRef.current?.abort();
    setIsTimerRunning(false);
    if (streamRef.current) stopMediaStream(streamRef.current);

    try {
      await axios.post(`${ServerUrl}/api/interview/finish`, { interviewId }, { withCredentials: true });
    } catch (e) {
      console.error(e);
    } finally {
      onFinish(interviewId);
    }
  }, [interviewId, onFinish, stopListening]);

  // ─────────────────────────────────────────────────────────────
  // MULTIPLE FACE WARNING
  // ─────────────────────────────────────────────────────────────
  const triggerMultipleFaceWarning = useCallback(() => {
    clearInterval(faceIntervalRef.current);
    let secs = 5;
    setWarningCountdown(secs);
    countdownRef.current = setInterval(() => {
      secs--;
      setWarningCountdown(secs);
      if (secs <= 0) { clearInterval(countdownRef.current); forceEndInterview(); }
    }, 1000);
  }, [forceEndInterview]);

  // ─────────────────────────────────────────────────────────────
  // FACE DETECTION POLLING
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCameraReady || !modelsLoaded) return;

    faceIntervalRef.current = setInterval(async () => {
      const video = userVideoRef.current;
      if (!video || video.readyState < 2 || isFinishingRef.current) return;
      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );
        setFaceCount(detections.length);
        if (detections.length > 1) triggerMultipleFaceWarning();
      } catch { /* ignore */ }
    }, 2500);

    return () => clearInterval(faceIntervalRef.current);
  }, [isCameraReady, modelsLoaded, triggerMultipleFaceWarning]);

  // ─────────────────────────────────────────────────────────────
  // COUNTDOWN TIMER
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTimerRunning) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(t); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isTimerRunning]);

  // ─────────────────────────────────────────────────────────────
  // START INTERVIEW GREETING
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!questions?.length || hasStartedRef.current) return;
    hasStartedRef.current = true;
    speak(`Hello ${username}, let's begin`, () => {
      setIsIntroPhase(false);
      speak(questions[0].question, () => setTimeLeft(questions[0]?.timeLimit || 30));
    });
  }, [questions, speak]);

  // ─────────────────────────────────────────────────────────────
  // SUBMIT ANSWER
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (isAuto = false) => {
    if (isFinishingRef.current) return;

    stopListening();
    const currentAnswer = answer.trim();
    if (!currentAnswer && !isAuto) { alert("Please enter your answer"); return; }

    try {
      await axios.post(
        `${ServerUrl}/api/interview/submit-answer`,
        {
          interviewId,
          answer: currentAnswer,
          index: currentIndex,
          timeTaken: (questions[currentIndex]?.timeLimit || 30) - timeLeft,
        },
        { withCredentials: true }
      );
    } catch (e) { console.log("Submit error:", e.response?.data); }

    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      speak("Next question", () => {
        setCurrentIndex(next);
        setAnswer("");
        committedRef.current = "";
        setTimeLeft(questions[next]?.timeLimit || 30);
        speak(questions[next].question);
      });
    } else {
      await forceEndInterview();
    }
  };

  if (!questions?.length) return <div>No questions found</div>;

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Finishing overlay */}
      <AnimatePresence>
        {isFinishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-50 gap-3">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xl font-semibold">Finishing Interview...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiple-face warning */}
      <AnimatePresence>
        {warningCountdown !== null && (
          <motion.div initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -60 }}
            className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-3 bg-red-600 text-white px-6 py-4 shadow-2xl">
            <MdOutlineWarningAmber className="text-3xl flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">⚠️ Multiple faces detected!</p>
              <p className="text-sm opacity-90">
                Interview will end in <strong>{warningCountdown}</strong> second{warningCountdown !== 1 ? "s" : ""}...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg grid md:grid-cols-2 overflow-hidden">

        {/* ══ LEFT ══ */}
        <div className="p-4 border-r flex flex-col gap-3">

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAIPlaying ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
            <p className="text-sm text-gray-500">
              {isIntroPhase ? "AI introducing..." : isAIPlaying ? "AI Speaking..." : "Your turn 🎤"}
            </p>
          </div>

          {/* AI avatar */}
          <video src={femalevoice} autoPlay muted loop className="rounded-xl w-full object-cover" style={{ maxHeight: "170px" }} />

          <div className="flex justify-between text-sm text-gray-500">
            <p>Q <strong>{currentIndex + 1}</strong> / <strong>{questions.length}</strong></p>
          </div>
          <div className="flex justify-center">
            <Timer timeLeft={timeLeft} totalTime={questions[currentIndex]?.timeLimit || 30} />
          </div>

          {/* User Camera */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-400 font-medium">Your Camera</p>
                {modelsLoaded && isCameraReady && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    faceCount > 1 ? "bg-red-100 text-red-600"
                    : faceCount === 1 ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"}`}>
                    {faceCount > 1 ? `⚠️ ${faceCount} faces` : faceCount === 1 ? "✅ 1 face" : "detecting..."}
                  </span>
                )}
                {!modelsLoaded && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse inline-block" />
                    loading guard...
                  </span>
                )}
              </div>

              <button onClick={toggleMic}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition
                  ${isMicActive ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 text-red-500 hover:bg-red-200"}`}>
                {isMicActive ? <BsMicFill /> : <BsMicMuteFill />}
                {isMicActive ? "Mic On" : "Mic Off"}
              </button>
            </div>

            {cameraError ? (
              <div className="bg-gray-800 rounded-xl flex flex-col items-center justify-center p-4 text-center" style={{ minHeight: "130px" }}>
                <BsCameraVideoOff className="text-gray-500 text-3xl mb-2" />
                <p className="text-gray-400 text-xs">{cameraError}</p>
              </div>
            ) : (
              <div className={`relative rounded-xl overflow-hidden bg-black border-2 transition-colors
                ${faceCount > 1 ? "border-red-500" : "border-transparent"}`} style={{ minHeight: "140px" }}>
                <video ref={userVideoRef} autoPlay muted playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)", maxHeight: "155px" }} />

                {isCameraReady && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isMicActive ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                    <span className="text-white text-xs">{isMicActive ? "Live" : "Muted"}</span>
                  </div>
                )}

                {isListening && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-green-600/80 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    <span className="text-white text-xs font-medium">Listening</span>
                  </div>
                )}

                {faceCount > 1 && (
                  <div className="absolute inset-0 border-4 border-red-500 rounded-xl animate-pulse pointer-events-none" />
                )}

                {!isCameraReady && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-4">

            {/* Question */}
            <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-xs text-gray-400 mb-1 font-medium">QUESTION {currentIndex + 1}</p>
              <p className="text-gray-800">{questions[currentIndex]?.question}</p>
            </div>

            {/* Answer area */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-medium">YOUR ANSWER</p>
                <span className="text-xs">
                  {!speechSupported
                    ? <span className="text-orange-400">⚠️ Type manually (voice not supported)</span>
                    : isListening
                    ? <span className="text-green-600 flex items-center gap-1 font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping inline-block" />
                        Listening — speak now
                      </span>
                    : isAIPlaying
                    ? <span className="text-gray-400">⏸ AI speaking...</span>
                    : !isMicActive
                    ? <span className="text-red-400">🔇 Mic off</span>
                    : <span className="text-gray-400">🎤 Mic starting...</span>
                  }
                </span>
              </div>

              <textarea
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  committedRef.current = e.target.value;
                }}
                disabled={isAIPlaying}
                placeholder={
                  isAIPlaying ? "Wait for AI to finish speaking..."
                  : speechSupported && isMicActive ? "Speak or type your answer here..."
                  : "Type your answer here..."
                }
                className={`w-full h-44 border rounded-lg p-3 text-sm resize-none outline-none transition
                  ${isAIPlaying
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                    : isListening
                    ? "bg-white border-green-400 ring-1 ring-green-300 text-gray-800"
                    : "bg-white border-gray-300 focus:border-green-500 text-gray-800"
                  }`}
              />

              {/* Interim preview */}
              {interimText && (
                <p className="text-xs text-gray-400 italic px-1">
                  🎤 <span className="text-gray-500">{interimText}</span>
                </p>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
            onClick={() => handleSubmit(false)}
            disabled={isAIPlaying || isFinishing}
            className={`mt-4 py-3 rounded-xl font-semibold text-white transition
              ${isAIPlaying || isFinishing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 shadow-md"}`}>
            {currentIndex < questions.length - 1 ? "Submit & Next →" : "Submit & Finish 🏁"}
          </motion.button>
        </div>

      </div>
    </div>
  );
};

export default Step2Interview;