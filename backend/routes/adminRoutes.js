import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { getStats, getUsers, updateUser, deleteUser } from "../controllers/adminController.js";
import { upload, uploadProductImage, getUploadStatus } from "../controllers/uploadController.js";

const router = express.Router();

router.use(protect, admin);

router.get("/stats", getStats);

router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Media / Cloudinary upload endpoints
router.post("/upload", upload.single("image"), uploadProductImage);
router.get("/upload/status", getUploadStatus);

router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
