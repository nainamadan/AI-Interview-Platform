import User from "../models/user.model.js";
import  generateToken from "../config/token.js"

// 🔥 Google Auth Controller
export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;
console.log("BODY:", req.body); // 👈 ADD THIS
    // check if user exists
    let user = await User.findOne({ email });

    // if not → create user
    if (!user) {
      user = await User.create({
        name,
        email,
       
      });
    }

    // generate token db se acces id (._)
    const token = await generateToken(user._id);

    // store token in cookie
    res.cookie("token", token, {
      // https true means app in development
      httpOnly: true,
      // loal host pe run krna h
      secure: false, // true in production (HTTPS)
      sameSite: "strict",
      // 7 days in millisecond
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // send response
    return res.status(200).json({
      success: true,
      user,
      token, // optional (frontend use)
    });

  } catch (error) {
    console.log("ERROR 🔴", error); // 👈 IMPORTANT
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const logoutUser = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // expire immediately
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};