import express from "express";
import  upload  from "../middleware/multer.js"; 
import {isAuth} from "../middleware/isAuth.js"
// multer middleware → file upload handle karega
import {generateQuestions} from "../controllers/interview.controller.js"
import {submitAnswer} from "../controllers/interview.controller.js"
import {finishInterview} from "../controllers/interview.controller.js"
import { analyzeResume } from "../controllers/interview.controller.js"; 
import {getMyInterviews}from "../controllers/interview.controller.js"; 
import {getInterviewReport}from "../controllers/interview.controller.js"; 
// controller function import

const router = express.Router();

// 🔥 Resume Analyze Route
router.post(
  "/resume",isAuth,
  upload.single("resume"), // ❗ "file" = frontend se aane wala field name
  analyzeResume          // controller call hoga
);
router.post("/generate-questions", isAuth, generateQuestions);


// 🔥 2. Submit Answer Route
// POST /api/interview/submit
router.post("/submit-answer", isAuth, submitAnswer);


// 🔥 3. Finish Interview Route
// POST /api/interview/finish
router.post("/finish", isAuth, finishInterview);

router.get("/get-interview", isAuth, getMyInterviews);

router.get("/report/:id",isAuth, getInterviewReport);
export default router;