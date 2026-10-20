import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile & Password
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

// Wishlist
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, addToWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

// Addresses
router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.put("/addresses/:addressId/default", protect, setDefaultAddress);

export default router;
