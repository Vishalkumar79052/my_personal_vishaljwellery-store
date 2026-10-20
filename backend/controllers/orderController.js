import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc Create new order from cart (checkout)
// @route POST /api/orders
export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = "cod" } = req.body;

  const user = await User.findById(req.user._id).populate("cart.product");
  if (!user || !Array.isArray(user.cart) || user.cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

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
      sku: product.sku || "",
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
    status: "pending",
    statusHistory: [
      {
        status: "pending",
        changedAt: new Date(),
        adminName: "Boutique Checkout System",
        notes: "Acquisition placed by client via online checkout",
      },
    ],
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
  res.json(orders || []);
};

// @desc Get single order (owner or admin only)
// @route GET /api/orders/:id
export const getOrderById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Order not found" });
  }

  const order = await Order.findById(req.params.id).populate("user", "name email phone");
  if (!order) return res.status(404).json({ message: "Order not found" });

  const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
  if (orderUserId && orderUserId !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to view this order" });
  }

  res.json(order);
};

// @desc Cancel order by customer (only allowed if pending, confirmed, or processing)
// @route PUT /api/orders/:id/cancel
export const cancelMyOrder = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Order not found" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
  if (orderUserId && orderUserId !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to cancel this order" });
  }

  const cancellableStatuses = ["pending", "confirmed", "processing"];
  if (!cancellableStatuses.includes(order.status)) {
    return res.status(400).json({
      message: `Cannot cancel an order with '${order.status}' status. Handover to logistics has commenced.`,
    });
  }

  const oldStatus = order.status;
  order.status = "cancelled";

  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status: "cancelled",
    changedAt: new Date(),
    changedBy: req.user._id,
    adminName: req.user.name || "Customer",
    notes: `Cancelled by customer from ${oldStatus} status`,
  });

  await order.save();
  res.json(order);
};


// ---------- Admin ----------

// @desc Get all orders (with optional filters, search, and sorting)
// @route GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  const { status, isPaid, keyword, startDate, endDate, sort } = req.query;
  const filter = {};

  if (status && status !== "all") {
    filter.status = status;
  }

  if (isPaid !== undefined && isPaid !== "all") {
    filter.isPaid = isPaid === "true";
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  let sortCriteria = { createdAt: -1 };
  if (sort === "oldest") sortCriteria = { createdAt: 1 };
  else if (sort === "amount_high") sortCriteria = { totalPrice: -1 };
  else if (sort === "amount_low") sortCriteria = { totalPrice: 1 };

  const orders = await Order.find(filter)
    .populate("user", "name email phone")
    .sort(sortCriteria);

  if (keyword) {
    const q = keyword.toLowerCase().trim();
    const filtered = orders.filter((o) => {
      return (
        o._id.toString().toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q) ||
        o.trackingNumber?.toLowerCase().includes(q)
      );
    });
    return res.json(filtered);
  }

  res.json(orders);
};

// @desc Update order status, tracking info, and payment status
// @route PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  const { status, trackingNumber, carrier, notes, isPaid } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const oldStatus = order.status;

  if (status) {
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Valid values: ${validStatuses.join(", ")}` });
    }

    // Business rule: Prevent cancelled orders from being marked delivered or shipped
    if (oldStatus === "cancelled" && status !== "cancelled") {
      return res.status(400).json({
        message: "Cannot transition a cancelled order directly. Please create a new order or reactivate via support.",
      });
    }

    // Business rule: Cannot cancel an order that is already delivered
    if (oldStatus === "delivered" && status === "cancelled") {
      return res.status(400).json({
        message: "Cannot cancel an order that is already delivered. Please process through returns.",
      });
    }

    order.status = status;

    // Milestone timestamps
    if (status === "confirmed" && !order.confirmedAt) {
      order.confirmedAt = new Date();
    }
    if (status === "processing") {
      if (!order.confirmedAt) order.confirmedAt = new Date();
      if (!order.processingAt) order.processingAt = new Date();
    }
    if (status === "shipped") {
      if (!order.confirmedAt) order.confirmedAt = new Date();
      if (!order.processingAt) order.processingAt = new Date();
      if (!order.shippedAt) order.shippedAt = new Date();
    }
    if (status === "delivered") {
      if (!order.confirmedAt) order.confirmedAt = new Date();
      if (!order.processingAt) order.processingAt = new Date();
      if (!order.shippedAt) order.shippedAt = new Date();
      if (!order.deliveredAt) order.deliveredAt = new Date();
      // NOTE: Payment status is kept strictly separate from fulfillment!
      // Do not mark COD order as paid just because it was delivered.
    }

    // Record status history
    if (status !== oldStatus) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status,
        changedAt: new Date(),
        changedBy: req.user?._id,
        adminName: req.user?.name || "Administrator",
        notes: notes || `Status updated from ${oldStatus} to ${status}`,
      });
    }
  }

  // Update tracking information
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber.trim();
  if (carrier !== undefined) order.carrier = carrier.trim();
  if (notes !== undefined && !status) order.notes = notes;

  // Update payment status independently
  if (isPaid !== undefined) {
    order.isPaid = Boolean(isPaid);
    if (order.isPaid && !order.paidAt) {
      order.paidAt = new Date();
    } else if (!order.isPaid) {
      order.paidAt = null;
    }
  }

  await order.save();
  res.json(order);
};
