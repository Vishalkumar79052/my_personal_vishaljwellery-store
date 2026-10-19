import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// @desc Get dashboard stats
// @route GET /api/admin/stats
export const getStats = async (req, res) => {
  const [userCount, productCount, orderCount, revenueAgg, lowStock, recentOrders] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    Product.find({ stock: { $lte: 5 } }).select("name stock price image category").limit(6),
    Order.find().sort({ createdAt: -1 }).limit(6).populate("user", "name email"),
  ]);

  const salesByDay = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    userCount,
    productCount,
    orderCount,
    totalRevenue: revenueAgg[0]?.total || 0,
    lowStock,
    recentOrders,
    salesByDay,
  });
};

// @desc Get all users
// @route GET /api/admin/users
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

// @desc Update a user's role or active status
// @route PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.role === "admin" && req.body.isActive === false) {
    return res.status(400).json({ message: "Cannot deactivate administrator accounts" });
  }

  if (req.body.role) user.role = req.body.role;
  if (typeof req.body.isActive === "boolean") user.isActive = req.body.isActive;

  const updated = await user.save();
  res.json(updated.toSafeObject());
};

// @desc Delete a user
// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Cannot delete an admin account" });
  await user.deleteOne();
  res.json({ message: "User removed" });
};
