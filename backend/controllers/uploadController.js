import multer from "multer";
import { uploadMedia, isCloudinaryConfigured } from "../config/cloudinary.js";

// Store file in memory before streaming to Cloudinary or disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed"), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// @desc Upload product image to Cloudinary (or local storage fallback)
// @route POST /api/admin/upload
export const uploadProductImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  try {
    const result = await uploadMedia(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.status(201).json({
      success: true,
      url: result.url,
      provider: result.provider,
      filename: result.filename || req.file.originalname,
      isCloudinary: result.provider === "cloudinary",
      message: result.provider === "cloudinary" 
        ? "Uploaded successfully to Cloudinary CDN" 
        : "Uploaded locally (configure Cloudinary in .env for CDN hosting)",
    });
  } catch (error) {
    console.error("[Upload] Error uploading image:", error);
    res.status(500).json({ message: error.message || "Failed to upload image" });
  }
};

// @desc Check Cloudinary status
// @route GET /api/admin/upload/status
export const getUploadStatus = (req, res) => {
  res.json({
    cloudinaryConfigured: isCloudinaryConfigured(),
    cloudName: isCloudinaryConfigured() ? process.env.CLOUDINARY_CLOUD_NAME : null,
    provider: isCloudinaryConfigured() ? "cloudinary" : "local",
  });
};
