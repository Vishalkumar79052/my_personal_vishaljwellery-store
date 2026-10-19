import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    brand: { type: String, default: "" },
    image: { type: String, required: true },
    images: [String],
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text" });

import { MockProduct } from "../config/mockStore.js";

const MongooseProduct = mongoose.model("Product", productSchema);

const Product = new Proxy(MongooseProduct, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in MockProduct) {
      return MockProduct[prop];
    }
    return target[prop];
  },
});

export default Product;
