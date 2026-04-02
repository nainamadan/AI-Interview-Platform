import fs from "fs"; 
// fs → file system module (file read/delete ke liye)

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// pdfjs → PDF ko read karke uska text extract karne ke liye
// legacy build Node.js friendly hai
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
// import your AI function (example)

import { askAi } from "../services/openRouter.services.js"; 
// askAi → tumhara AI service function jo OpenRouter call karta hai

// 🔥 Resume Analyze Controller
export const analyzeResume = async (req, res) => {
  try {
    const file = req.file;
    const uint8Array = new Uint8Array(file.buffer);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map((item) => item.str);
      text += strings.join(" ");
    }

    const resumeText = text;

    const skills = [];
    if (text.toLowerCase().includes("react")) skills.push("React");
    if (text.toLowerCase().includes("node")) skills.push("Node.js");
    if (text.toLowerCase().includes("mongodb")) skills.push("MongoDB");
    if (text.toLowerCase().includes("express")) skills.push("Express");

    const projects = [];
    if (text.includes("LMS")) projects.push("LMS");
    if (text.includes("FoodieHub")) projects.push("FoodieHub");

    const role = text.includes("MERN") ? "MERN Developer" : "";
    const experience = "Fresher";

    res.json({
      success: true,
      role,
      experience,
      skills,
      projects,
      resumeText,
    });

  } catch (error) {
    console.log("PDF Error:", error);
    res.status(500).json({ message: "Error analyzing resume" });
  }
};




export const generateQuestions = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required" });
    }

    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      console.log("❌ req.user missing:", req.user);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    // ✅ FIX: user null check
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credits < 50) {
      return res.status(400).json({ message: "Not enough credits" });
    }

    let skillsText = Array.isArray(skills) && skills.length > 0
      ? skills.join(", ")
      : "None";

    let projectText = Array.isArray(projects) && projects.length > 0
      ? projects.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role:${role}
Experience:${experience}
InterviewMode:${mode}
Projects:${projectText}
Skills:${skillsText}
Resume:${safeResume}
`.trim();

    const messages = [
      {
        role: "system",
        content: `Generate exactly 5 interview questions. One per line. No numbering.`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    const aiResponse = await askAi(messages);

    console.log("AI Response:", aiResponse); // ✅ debug

    if (!aiResponse || typeof aiResponse !== "string") {
      return res.status(500).json({ message: "AI failed" });
    }

    // ✅ FIX: clean AI output
    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.replace(/^\d+[\).\s-]*/, "").trim())
      .filter(q => q.length > 10)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({ message: "Invalid AI questions" });
    }

    user.credits -= 50;
    await user.save();

    // ✅🔥 MAIN FIX (index added)
    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: "Medium",
        timeLimit: 30 + index * 10
      }))
    });

    return res.status(200).json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      username: user.name,
      questions: interview.questions
    });

  } catch (error) {
    console.error("Generate Error:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};



export const submitAnswer = async (req, res) => {
  try {
    // 🔹 1. Get data from frontend
    const { interviewId, answer, timeTaken, index } = req.body;

    // 🔹 2. Validate input
    if (!interviewId || index === undefined) {
      
      return res.status(400).json({ message: "InterviewId and index are required" });
    }

    // 🔹 3. Find interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // 🔹 4. Get current question using index
    const question = interview.questions[index];

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 🔹 5. Check time limit exceeded
    if (timeTaken > question.timeLimit) {
  question.answer = answer || "";
  question.score = 0;
  question.feedback = "Time exceeded";
  await interview.save();

  return res.json({ score: 0 });
}

    // 🔥 6. Prepare AI messages for evaluation
    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];

    // 🔹 7. Call AI
    const aiResponse = await askAi(messages);

    if (!aiResponse) {
      return res.status(500).json({ message: "AI evaluation failed" });
    }

    // 🔹 8. Parse AI JSON response safely
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({ message: "Invalid AI response format" });
    }

    const {
      confidence = 0,
      communication = 0,
      correctness = 0,
      finalScore = 0,
      feedback = "No feedback"
    } = parsed;

    // 🔹 9. Save values in question
    question.answer = answer;
    question.confidence = confidence;
    question.communication = communication;
    question.correctness = correctness;
    question.score = finalScore;
    question.feedback = feedback;

    // 🔹 10. Save interview
    await interview.save();

    // 🔹 11. Return response
    return res.status(200).json({
      feedback: question.feedback,
      score: question.score,
      confidence,
      communication,
      correctness
    });

  } catch (error) {
    // 🔹 12. Catch error
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

export const finishInterview = async (req, res) => {
  try {
    // 🔹 1. Get interviewId
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ message: "InterviewId is required" });
    }

    // 🔹 2. Find interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const questions = interview.questions;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "No questions found" });
    }

    // 🔥 3. Initialize totals
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    let totalQuestions = questions.length;

    // 🔹 4. Loop through questions
    questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    // 🔥 5. Calculate averages
    const avgScore = Math.round(totalScore / totalQuestions);
    const avgConfidence = Math.round(totalConfidence / totalQuestions);
    const avgCommunication = Math.round(totalCommunication / totalQuestions);
    const avgCorrectness = Math.round(totalCorrectness / totalQuestions);

    // 🔥 6. Final Score (combined intelligence)
    const finalScore = Math.round(
      (avgScore + avgConfidence + avgCommunication + avgCorrectness) / 4
    );

    // 🔹 7. Update interview
    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    // 🔹 8. Prepare question-wise report
    const questionWise = questions.map((q) => ({
      question: q.question,
      answer: q.answer,
      score: q.score,
      confidence: q.confidence,
      communication: q.communication,
      correctness: q.correctness,
      feedback: q.feedback,
    }));

    // 🔹 9. Send response
    return res.status(200).json({
      message: "Interview completed successfully",

      finalScore,

      averages: {
        score: avgScore,
        confidence: avgConfidence,
        communication: avgCommunication,
        correctness: avgCorrectness,
      },

      questions: questionWise,
    });

  } catch (error) {
    // 🔹 10. Error handling
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// 🔥 Get all interviews of current user
export const getMyInterviews = async (req, res) => {
  try {
    // 🔹 logged-in user id (JWT middleware se aata hai)
    const userId = req.user.id;

    // 🔹 DB me se sirf isi user ke interviews nikaal rahe hain
    const interviews = await Interview.find({ userId })
      
      // 🔥 sirf required fields hi bhejna (optimization)
      .select("role experience mode finalScore status createdAt")

      // 🔥 latest interview upar (descending order)
      .sort({ createdAt: -1 });

    // ❌ agar kuch bhi nahi mila
    if (!interviews || interviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Failed to find current user interviews",
      });
    }

    // ✅ success response
    res.status(200).json({
      success: true,
      interviews,
    });

  } catch (error) {
    console.error("Get Interviews Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



// 🔥 Get detailed report of single interview
export const getInterviewReport = async (req, res) => {
  try {
    // 🔹 URL se interview id aa rhi hai
    const { id } = req.params;

    // 🔹 current user id
    const userId = req.user.id;

    // 🔥 DB se specific interview find karo
    const interview = await Interview.findOne({
      _id: id,
      userId, // 🔥 security: sirf apna hi interview dekh sake
    });

    // ❌ agar nahi mila
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Failed to find current user report",
      });
    }
if (interview.status !== "completed") {
  return res.status(400).json({
    success: false,
    message: "Interview not completed yet",
  });
}
console.log("🔥 Interview completed:", interview._id);
    // =========================================
    // 🔥 CALCULATIONS (average nikaalna)
    // =========================================

    let totalCorrectness = 0;
    let totalCommunication = 0;
    let totalConfidence = 0;

    const totalQuestions = interview.questions.length;

    // 🔹 har question ka data loop kar rahe hain
    interview.questions.forEach((q) => {
      totalCorrectness += q.correctness || 0;
      totalCommunication += q.communication || 0;
      totalConfidence += q.confidence || 0;
    });

    // 🔹 averages
    const avgCorrectness = Math.round(totalCorrectness / totalQuestions);
    const avgCommunication = Math.round(totalCommunication / totalQuestions);
    const avgConfidence = Math.round(totalConfidence / totalQuestions);

    // =========================================
    // 🔥 QUESTION WISE DATA
    // =========================================
    const questionWise = interview.questions.map((q, index) => ({
      questionNo: index + 1,
      question: q.question,
      answer: q.answer,
      score: q.score,
      correctness: q.correctness,
      communication: q.communication,
      confidence: q.confidence,
      feedback: q.feedback,
    }));

    // =========================================
    // ✅ FINAL RESPONSE
    // =========================================
 res.status(200).json({
  success: true,
  report: {
    role: interview.role,
    experience: interview.experience,
    mode: interview.mode,
    finalScore: interview.finalScore,
    status: interview.status,
    createdAt: interview.createdAt,
    averageCorrectness: avgCorrectness,
    averageCommunication: avgCommunication,
    averageConfidence: avgConfidence,
    questionWise,
  },
});
  } catch (error) {
    console.error("Get Report Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};