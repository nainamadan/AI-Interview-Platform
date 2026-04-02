// multer.js
import multer from "multer";

// storage config
const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "public"); // folder where files are stored
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// multer instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload; // ✅ default export