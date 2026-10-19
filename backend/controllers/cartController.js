import User from "../models/User.js";
import Product from "../models/Product.js";

const populateCart = (userDoc) => userDoc.populate("cart.product");

// @desc Get current user's cart
// @route GET /api/cart
export const getCart = async (req, res) => {
  const user = await populateCart(User.findById(req.user._id));
  res.json(user.cart);
};

// @desc Add item to cart (or increase quantity)
// @route POST /api/cart
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stock < quantity) return res.status(400).json({ message: "Not enough stock" });

  const user = await User.findById(req.user._id);
  const existingItem = user.cart.find((item) => item.product.toString() === productId);

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    user.cart.push({ product: productId, quantity });
  }

  await user.save();
  const populated = await populateCart(User.findById(req.user._id));
  res.status(201).json(populated.cart);
};

// @desc Update quantity of a cart item
// @route PUT /api/cart/:productId
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const user = await User.findById(req.user._id);

  const item = user.cart.find((i) => i.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ message: "Item not in cart" });

  if (quantity <= 0) {
    user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
  } else {
    item.quantity = quantity;
  }

  await user.save();
  const populated = await populateCart(User.findById(req.user._id));
  res.json(populated.cart);
};

// @desc Remove item from cart
// @route DELETE /api/cart/:productId
export const removeCartItem = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter((i) => i.product.toString() !== req.params.productId);
  await user.save();
  const populated = await populateCart(User.findById(req.user._id));
  res.json(populated.cart);
};

// @desc Clear entire cart
// @route DELETE /api/cart
export const clearCart = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();
  res.json([]);
};
