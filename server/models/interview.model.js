import mongoose from "mongoose";

// 🔹 Question Subschema (inside interview)
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    timeLimit: {
      type: Number, // in seconds
      default: 60,
    },
    answer: {
      type: String,
    },
    feedback: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
    confidence: {
      type: Number, // 0–100
      default: 0,
    },
    communication: {
      type: Number, // 0–100
      default: 0,
    },
    correctness: {
      type: Number, // 0–100
      default: 0,
    },
  },
  { _id: true } // each question will have its own id
);

// 🔹 Interview Schema
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      enum: ["Fresher", "Junior", "Mid", "Senior"],
      default: "Fresher",
    },

    mode: {
      type: String,
      enum: ["HR", "TECHNICAL"],
      required: true,
    },

    resumeText: {
      type: String,
    },

    // 🔥 Embedded Questions
    questions: [questionSchema],

    finalScore: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["completed", "incompleted"],
      default: "incompleted",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;