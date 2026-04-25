import express from "express";
import {
  createOrder,
  verifyPaymentController,
  freeCreditsController,
} from "../controllers/payment.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const paymentrouter = express.Router();

paymentrouter.post("/create-order", isAuth, createOrder);
paymentrouter.post("/verify", isAuth, verifyPaymentController);
paymentrouter.post("/free-credits", isAuth, freeCreditsController); // 🆓 Free plan route

export default paymentrouter;