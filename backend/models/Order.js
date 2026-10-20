import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    sku: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminName: { type: String, default: "System" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    paymentMethod: { type: String, default: "cod" },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: { type: String, default: "" },
    carrier: { type: String, default: "" },
    notes: { type: String, default: "" },
    confirmedAt: Date,
    processingAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

import { MockOrder } from "../config/mockStore.js";

const MongooseOrder = mongoose.model("Order", orderSchema);

const Order = new Proxy(MongooseOrder, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in MockOrder) {
      return MockOrder[prop];
    }
    return target[prop];
  },
});

export default Order;
