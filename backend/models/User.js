import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    postalCode: { type: String, required: true },
    country: { type: String, default: "India" },
    phone: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    address: addressSchema,
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

import { MockUser } from "../config/mockStore.js";

const MongooseUser = mongoose.model("User", userSchema);

const User = new Proxy(MongooseUser, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in MockUser) {
      return MockUser[prop];
    }
    return target[prop];
  },
});

export default User;
