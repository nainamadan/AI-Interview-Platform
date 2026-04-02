import express from "express";
import { getCurrentUser } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const userrouter = express.Router();

userrouter.get("/current-user", isAuth, getCurrentUser);

export default userrouter;