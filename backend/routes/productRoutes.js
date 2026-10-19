import express from "express";
import { getProducts, getProductById, getCategories, addReview } from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", protect, addReview);

export default router;
