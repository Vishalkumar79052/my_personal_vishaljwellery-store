import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import {
  getStats,
  getUsers,
  getUserOrders,
  updateUser,
  deleteUser,
  updateProductStock,
  getStoreSettings,
  updateStoreSettings,
  getCategoriesList,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/adminController.js";
import { upload, uploadProductImage, getUploadStatus } from "../controllers/uploadController.js";

const router = express.Router();

router.use(protect, admin);

// Analytics & Dashboard KPIs
router.get("/stats", getStats);

// Product Management
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id/stock", updateProductStock);

// Category Management
router.get("/categories", getCategoriesList);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Media / Cloudinary upload endpoints
router.post("/upload", upload.single("image"), uploadProductImage);
router.get("/upload/status", getUploadStatus);

// Order Management
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Customer Management & Orders History
router.get("/users", getUsers);
router.get("/users/:id/orders", getUserOrders);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Store Settings
router.get("/settings", getStoreSettings);
router.put("/settings", updateStoreSettings);

export default router;
