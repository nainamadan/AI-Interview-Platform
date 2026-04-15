// multer.js
import multer from "multer";

// storage config — memoryStorage keeps file in memory as Buffer (req.file.buffer)
const storage = multer.memoryStorage();

// multer instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload; // ✅ default export