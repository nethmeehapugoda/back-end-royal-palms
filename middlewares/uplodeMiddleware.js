import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + original name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + "-" + uniqueSuffix + fileExtension;
    cb(null, fileName);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Middleware for single image upload
export const uploadSingle = upload.single("image");

// Middleware for multiple image upload (if needed later)
export const uploadMultiple = upload.array("images", 5);

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Unexpected field name for file upload.",
      });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      message: "Only image files are allowed!",
    });
  }

  next(error);
};
