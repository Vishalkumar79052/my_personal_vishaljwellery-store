import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// @desc Get comprehensive executive dashboard stats
// @route GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const range = req.query.range || "7d";
    let days = 7;
    if (range === "30d") days = 30;
    else if (range === "90d") days = 90;
    else if (range === "1y") days = 365;

    const rangeStartDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      userCount,
      productCount,
      orderCount,
      revenueAgg,
      pendingRevenueAgg,
      lowStock,
      outOfStockList,
      recentOrders,
      statusBreakdownAgg,
      bestSellersAgg,
      recentUsers,
      categoriesAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Order.countDocuments(),
      // Eligible revenue: strictly paid and non-cancelled orders
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      // Pending / Uncollected pipeline (COD pending / unpaid)
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, isPaid: false } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Product.find({ stock: { $gt: 0, $lte: 5 } }).select("name stock price image category sku").limit(8),
      Product.find({ stock: { $lte: 0 } }).select("name stock price image category sku").limit(8),
      Order.find().sort({ createdAt: -1 }).limit(8).populate("user", "name email"),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalPrice" },
          },
        },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            price: { $first: "$items.price" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
      ]),
      User.find({ role: "user" }).select("name email createdAt isActive").sort({ createdAt: -1 }).limit(5),
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalStock: { $sum: "$stock" },
            avgPrice: { $avg: "$price" },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const salesByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: rangeStartDate }, status: { $ne: "cancelled" }, isPaid: true } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format order status counts (including confirmed)
    const orderStatusCounts = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    statusBreakdownAgg.forEach((s) => {
      if (s._id && orderStatusCounts[s._id] !== undefined) {
        orderStatusCounts[s._id] = s.count;
      }
    });

    // Calculate total inventory valuation
    const inventoryValuationAgg = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalUnits: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
    ]);

    const totalInventoryValue = inventoryValuationAgg[0]?.totalValue || 0;
    const totalInventoryUnits = inventoryValuationAgg[0]?.totalUnits || 0;
    const outOfStockCount = await Product.countDocuments({ stock: { $lte: 0 } });
    const lowStockCount = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });

    res.json({
      // Backward-compatible core keys for tests and UI
      userCount,
      productCount,
      orderCount,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingRevenue: pendingRevenueAgg[0]?.total || 0,
      lowStock,
      recentOrders,
      salesByDay,

      // Enhanced executive metrics
      range,
      days,
      orderStatusCounts,
      outOfStockCount,
      lowStockCount,
      outOfStockList,
      bestSellers: bestSellersAgg,
      recentUsers,
      categories: categoriesAgg,
      totalInventoryValue,
      totalInventoryUnits,
    });
  } catch (error) {
    console.error("[Admin Stats Error]:", error);
    res.status(500).json({ message: "Failed to generate dashboard statistics", error: error.message });
  }
};

// @desc Get all users with order statistics
// @route GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const [users, orderStats] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).lean(),
      Order.aggregate([
        {
          $group: {
            _id: "$user",
            orderCount: { $sum: 1 },
            totalSpent: { $sum: "$totalPrice" },
            lastOrderDate: { $max: "$createdAt" },
          },
        },
      ]),
    ]);

    const statsMap = new Map();
    orderStats.forEach((stat) => {
      if (stat._id) {
        statsMap.set(stat._id.toString(), stat);
      }
    });

    const enrichedUsers = users.map((u) => {
      const stat = statsMap.get(u._id.toString());
      return {
        ...u,
        orderCount: stat?.orderCount || 0,
        totalSpent: stat?.totalSpent || 0,
        lastOrderDate: stat?.lastOrderDate || null,
      };
    });

    res.json(enrichedUsers);
  } catch (error) {
    console.error("[Admin Get Users Error]:", error);
    res.status(500).json({ message: "Failed to fetch user accounts", error: error.message });
  }
};

// @desc Get orders for a specific user
// @route GET /api/admin/users/:id/orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json(orders);
  } catch (error) {
    console.error("[Admin Get User Orders Error]:", error);
    res.status(500).json({ message: "Failed to fetch customer orders", error: error.message });
  }
};

// @desc Update product stock quantity
// @route PUT /api/admin/products/:id/stock
export const updateProductStock = async (req, res) => {
  try {
    const { stock, action, amount } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (action === "increment") {
      const step = Number(amount) || 1;
      product.stock = Math.max(0, product.stock + step);
    } else if (action === "decrement") {
      const step = Number(amount) || 1;
      product.stock = Math.max(0, product.stock - step);
    } else {
      const newStock = Number(stock);
      if (isNaN(newStock) || newStock < 0) {
        return res.status(400).json({ message: "Invalid stock quantity. Must be a non-negative number." });
      }
      product.stock = Math.floor(newStock);
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("[Admin Stock Update Error]:", error);
    res.status(500).json({ message: "Failed to update inventory stock", error: error.message });
  }
};

// @desc Update a user's role or active status
// @route PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin" && req.body.isActive === false) {
      return res.status(400).json({ message: "Cannot deactivate administrator accounts" });
    }

    if (req.body.role) user.role = req.body.role;
    if (typeof req.body.isActive === "boolean") user.isActive = req.body.isActive;

    const updated = await user.save();
    res.json(updated.toSafeObject());
  } catch (error) {
    console.error("[Admin Update User Error]:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// @desc Delete a user
// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot delete an admin account" });
    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    console.error("[Admin Delete User Error]:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// ---------- Store Settings Management ----------
import Setting from "../models/Setting.js";
import Category from "../models/Category.js";

// @desc Get boutique settings
// @route GET /api/admin/settings
export const getStoreSettings = async (req, res) => {
  try {
    const settings = await Setting.getStoreSettings();
    res.json(settings);
  } catch (error) {
    console.error("[Admin Get Settings Error]:", error);
    res.status(500).json({ message: "Failed to retrieve store settings" });
  }
};

// @desc Update boutique settings
// @route PUT /api/admin/settings
export const updateStoreSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    const {
      storeName,
      tagline,
      contactEmail,
      contactPhone,
      currency,
      currencySymbol,
      lowStockThreshold,
      freeShippingThreshold,
      storeAddress,
      aboutStory,
    } = req.body;

    if (storeName) settings.storeName = storeName.trim();
    if (tagline !== undefined) settings.tagline = tagline.trim();
    if (contactEmail) settings.contactEmail = contactEmail.trim();
    if (contactPhone) settings.contactPhone = contactPhone.trim();
    if (currency) settings.currency = currency.trim();
    if (currencySymbol) settings.currencySymbol = currencySymbol.trim();
    if (lowStockThreshold !== undefined) settings.lowStockThreshold = Number(lowStockThreshold);
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (storeAddress) settings.storeAddress = storeAddress.trim();
    if (aboutStory) settings.aboutStory = aboutStory.trim();

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("[Admin Update Settings Error]:", error);
    res.status(500).json({ message: "Failed to update store settings" });
  }
};

// ---------- Category Governance ----------

// @desc Get all jewellery categories with item count
// @route GET /api/admin/categories
export const getCategoriesList = async (req, res) => {
  try {
    await Category.seedDefaultsIfEmpty();
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });

    // Count products per category
    const productCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    productCounts.forEach((c) => countMap.set(c._id, c.count));

    const enriched = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap.get(cat.name) || 0,
    }));

    res.json(enriched);
  } catch (error) {
    console.error("[Admin Get Categories Error]:", error);
    res.status(500).json({ message: "Failed to fetch categories list" });
  }
};

// @desc Create new category
// @route POST /api/admin/categories
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, featured, sortOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: `Category "${name}" already exists` });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      image: image || "",
      featured: Boolean(featured),
      sortOrder: Number(sortOrder) || 0,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("[Admin Create Category Error]:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

// @desc Update category
// @route PUT /api/admin/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const { name, description, image, featured, sortOrder } = req.body;
    const oldName = category.name;

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (featured !== undefined) category.featured = Boolean(featured);
    if (sortOrder !== undefined) category.sortOrder = Number(sortOrder);

    await category.save();

    // If name changed, update products that reference this category
    if (name && name.trim() !== oldName) {
      await Product.updateMany({ category: oldName }, { category: name.trim() });
    }

    res.json(category);
  } catch (error) {
    console.error("[Admin Update Category Error]:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

// @desc Delete category (blocked if active products are assigned)
// @route DELETE /api/admin/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Check if products still use this category
    const inUseCount = await Product.countDocuments({ category: category.name });
    if (inUseCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category "${category.name}" because it is currently assigned to ${inUseCount} product(s). Please reassign those products first.`,
      });
    }

    await category.deleteOne();
    res.json({ message: `Category "${category.name}" removed` });
  } catch (error) {
    console.error("[Admin Delete Category Error]:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};
