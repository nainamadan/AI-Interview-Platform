import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    credits: {
      type: Number,
      default: 100,
    },

    provider: {
      type: String,
      default: "google", // firebase/google login
    },
  },
  {
    timestamps: true, // 🔥 this adds createdAt & updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;