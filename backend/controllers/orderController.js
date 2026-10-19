import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc Create new order from cart (checkout)
// @route POST /api/orders
export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = "cod" } = req.body;

  const user = await User.findById(req.user._id).populate("cart.product");
  if (!user.cart.length) return res.status(400).json({ message: "Cart is empty" });

  let itemsPrice = 0;
  const items = [];

  for (const cartItem of user.cart) {
    const product = cartItem.product;
    if (!product || product.stock < cartItem.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product?.name || "item"}` });
    }
    itemsPrice += product.price * cartItem.quantity;
    items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: cartItem.quantity,
    });
  }

  const shippingPrice = itemsPrice > 100 ? 0 : 9.99;
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  // decrement stock
  for (const cartItem of user.cart) {
    await Product.findByIdAndUpdate(cartItem.product._id, {
      $inc: { stock: -cartItem.quantity },
    });
  }

  user.cart = [];
  await user.save();

  res.status(201).json(order);
};

// @desc Get logged-in user's orders
// @route GET /api/orders/my
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc Get single order (owner or admin only)
// @route GET /api/orders/:id
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to view this order" });
  }

  res.json(order);
};

// ---------- Admin ----------

// @desc Get all orders
// @route GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
};

// @desc Update order status
// @route PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  if (status === "delivered") order.deliveredAt = new Date();
  await order.save();
  res.json(order);
};
