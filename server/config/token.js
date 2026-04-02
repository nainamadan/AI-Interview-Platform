// generate token
import jwt from "jsonwebtoken";

// Generate Token

// db se userid milegi
export const generateToken = async(userId) => {
try {
    return jwt.sign(
      { id: userId },              // payload
      process.env.JWT_SECRET,      // secret key
      { expiresIn: "7d" }          // expiry
    );
} catch (error) {
  console.log(error);
  
}
};
export default generateToken