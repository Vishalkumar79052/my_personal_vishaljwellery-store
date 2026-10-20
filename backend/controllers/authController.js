import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc Register new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email and password" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) return res.status(400).json({ message: "Email already registered" });

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    password,
    phone: phone ? phone.trim() : "",
  });

  res.status(201).json({
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || "").toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (user.role === "admin") {
    user.isActive = true;
  } else if (!user.isActive) {
    return res.status(403).json({ message: "This account has been deactivated" });
  }

  res.json({
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
};

// @desc Get current user profile
// @route GET /api/auth/profile
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password").populate("wishlist");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// @desc Update current user profile
// @route PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.name = req.body.name ? req.body.name.trim() : user.name;
  user.phone = req.body.phone !== undefined ? req.body.phone.trim() : user.phone;
  user.avatar = req.body.avatar ?? user.avatar;
  if (req.body.address) user.address = req.body.address;

  const updated = await user.save();
  res.json(updated.toSafeObject());
};

// @desc Securely change password
// @route PUT /api/auth/password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current password and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long" });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect current password" });
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
};

// ---------- Wishlist Management ----------

// @desc Get customer's saved wishlist pieces
// @route GET /api/auth/wishlist
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.wishlist || []);
};

// @desc Add jewellery piece to wishlist
// @route POST /api/auth/wishlist/:productId
export const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const alreadySaved = user.wishlist.some((id) => id.toString() === productId);
  if (!alreadySaved) {
    user.wishlist.push(productId);
    await user.save();
  }

  const updatedUser = await User.findById(req.user._id).populate("wishlist");
  res.json(updatedUser.wishlist || []);
};

// @desc Remove piece from wishlist
// @route DELETE /api/auth/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate("wishlist");
  res.json(updatedUser.wishlist || []);
};

// ---------- Address Book Management ----------

// @desc Get customer's saved shipping addresses
// @route GET /api/auth/addresses
export const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.addresses || []);
};

// @desc Add new shipping address
// @route POST /api/auth/addresses
export const addAddress = async (req, res) => {
  const { fullName, line1, line2, city, state, postalCode, country, phone, isDefault } = req.body;
  if (!fullName || !line1 || !city || !postalCode) {
    return res.status(400).json({ message: "Full name, address line 1, city, and postal code are required" });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.addresses) user.addresses = [];

  // If set as default or first address, clear existing defaults
  const willBeDefault = isDefault || user.addresses.length === 0;
  if (willBeDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  const newAddr = {
    fullName: fullName.trim(),
    line1: line1.trim(),
    line2: line2 ? line2.trim() : "",
    city: city.trim(),
    state: state ? state.trim() : "",
    postalCode: postalCode.trim(),
    country: country || "India",
    phone: phone ? phone.trim() : "",
    isDefault: willBeDefault,
  };

  user.addresses.push(newAddr);
  // Also sync primary address field for backward compatibility
  if (willBeDefault) {
    user.address = newAddr;
  }

  await user.save();
  res.status(201).json(user.addresses);
};

// @desc Update an existing address
// @route PUT /api/auth/addresses/:addressId
export const updateAddress = async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const addr = user.addresses.id(addressId);
  if (!addr) return res.status(404).json({ message: "Address not found" });

  const { fullName, line1, line2, city, state, postalCode, country, phone, isDefault } = req.body;
  if (fullName) addr.fullName = fullName.trim();
  if (line1) addr.line1 = line1.trim();
  if (line2 !== undefined) addr.line2 = line2.trim();
  if (city) addr.city = city.trim();
  if (state !== undefined) addr.state = state.trim();
  if (postalCode) addr.postalCode = postalCode.trim();
  if (country) addr.country = country;
  if (phone !== undefined) addr.phone = phone.trim();

  if (isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === addressId;
    });
    user.address = addr;
  }

  await user.save();
  res.json(user.addresses);
};

// @desc Delete an address
// @route DELETE /api/auth/addresses/:addressId
export const deleteAddress = async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
  await user.save();
  res.json(user.addresses);
};

// @desc Set address as default
// @route PUT /api/auth/addresses/:addressId/default
export const setDefaultAddress = async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  let found = false;
  user.addresses.forEach((a) => {
    if (a._id.toString() === addressId) {
      a.isDefault = true;
      user.address = a;
      found = true;
    } else {
      a.isDefault = false;
    }
  });

  if (!found) return res.status(404).json({ message: "Address not found" });

  await user.save();
  res.json(user.addresses);
};
