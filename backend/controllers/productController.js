import Product from "../models/Product.js";

// @desc Get all products (with search, filter, pagination)
// @route GET /api/products
export const getProducts = async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12, stockStatus, isActive } = req.query;

  const filter = {};
  if (isActive !== undefined && isActive !== "all") {
    filter.isActive = isActive === "true";
  } else if (isActive === undefined) {
    filter.isActive = true;
  }

  if (keyword) {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escapedKeyword, $options: "i" } },
      { category: { $regex: escapedKeyword, $options: "i" } },
      { sku: { $regex: escapedKeyword, $options: "i" } },
      { brand: { $regex: escapedKeyword, $options: "i" } },
    ];
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (stockStatus === "out") {
    filter.stock = { $lte: 0 };
  } else if (stockStatus === "low") {
    filter.stock = { $gt: 0, $lte: 5 };
  } else if (stockStatus === "in") {
    filter.stock = { $gt: 5 };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { rating: -1 };
  if (sort === "stock_asc") sortOption = { stock: 1 };
  if (sort === "stock_desc") sortOption = { stock: -1 };
  if (sort === "name_asc") sortOption = { name: 1 };
  if (sort === "name_desc") sortOption = { name: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
};

// @desc Get single product
// @route GET /api/products/:id
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// @desc Get distinct categories
// @route GET /api/products/categories
export const getCategories = async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.json(categories);
};

// @desc Add a review to a product
// @route POST /api/products/:id/reviews
export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) return res.status(400).json({ message: "You already reviewed this product" });

  product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
};

// ---------- Admin ----------

// @desc Create product
// @route POST /api/admin/products
export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

// @desc Update product
// @route PUT /api/admin/products/:id
export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// @desc Delete product
// @route DELETE /api/admin/products/:id
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product removed" });
};
