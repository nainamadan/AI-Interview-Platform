// import dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/connectDb.js"
import cookieParser from "cookie-parser";
import authrouter from "./routes/auth.routes.js";
import userrouter from "./routes/user.routes.js";
import router from "./routes/netrview.route.js"
import paymentrouter from "./routes/payment.route.js"
// // config dotenv
dotenv.config();

// create app
const app = express();

// // middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://ai-interview-platform-8f4n.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
// test route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });
app.use("/api/auth",authrouter)

app.use("/api/user",userrouter)
app.use("/api/interview",router)
app.use("/api/payment",paymentrouter)
// port
const PORT = process.env.PORT || 6000;

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});