import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    !CLOUDINARY_CLOUD_NAME.includes("your_")
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload buffer to Cloudinary or fallback to local disk
 * @param {Buffer} buffer 
 * @param {string} originalname 
 * @param {string} mimetype 
 * @returns {Promise<{ url: string, provider: 'cloudinary' | 'local', filename: string }>}
 */
export async function uploadMedia(buffer, originalname = "upload.jpg", mimetype = "image/jpeg") {
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const folder = process.env.CLOUDINARY_FOLDER || "vishal-jewellery-products";
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("[Cloudinary] Upload failed, falling back to local storage:", error.message);
            resolve(saveLocally(buffer, originalname));
          } else {
            resolve({
              url: result.secure_url,
              provider: "cloudinary",
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
            });
          }
        }
      );
      uploadStream.end(buffer);
    });
  }

  return saveLocally(buffer, originalname);
}

function saveLocally(buffer, originalname) {
  const cleanExt = path.extname(originalname) || ".jpg";
  const cleanBase = path.basename(originalname, cleanExt).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
  const filename = `${cleanBase}-${Date.now()}${cleanExt}`;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    provider: "local",
    filename,
    bytes: buffer.length,
  };
}

export default cloudinary;
