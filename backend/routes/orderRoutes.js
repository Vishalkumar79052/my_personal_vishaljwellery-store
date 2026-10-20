import express from "express";
import { createOrder, getMyOrders, getOrderById, cancelMyOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelMyOrder);

export default router;
