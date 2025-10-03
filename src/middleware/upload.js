// Reasoning: Multer configuration to validate image uploads (size/type) and prevent malicious files
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const config = require("../config");

const uploadDir = path.join(process.cwd(), config.UPLOAD.dir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Reasoning: Avoid using original filename to prevent path traversal; create safe unique name
    const ext = path.extname(file.originalname).toLowerCase();
    const base = crypto.randomBytes(16).toString("hex");
    cb(null, `${base}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  // Reasoning: Accept only common image types
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.UPLOAD.maxFileSizeMB * 1024 * 1024 },
});

module.exports = upload;
