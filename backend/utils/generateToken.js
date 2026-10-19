import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || "verdant_store_jwt_secret_key_2026", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
