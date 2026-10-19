import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { JEWELLERY_PRODUCTS } from "../config/initialProducts.js";

dotenv.config();
await connectDB();

const run = async () => {
  await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);

  const admin = await User.create({
    name: "Vishal Kumar",
    email: "vishalcse340@gmail.com",
    password: "vishal123",
    role: "admin",
    isActive: true,
  });

  const demoUser = await User.create({
    name: "Demo Shopper",
    email: "user@example.com",
    password: "user1234",
    role: "user",
    isActive: true,
  });

  const products = await Product.insertMany(JEWELLERY_PRODUCTS);

  console.log("Seed complete:");
  console.log(`  Admin login:  vishalcse340@gmail.com / vishal123`);
  console.log(`  User login:   user@example.com / user1234`);
  console.log(`  Jewellery products created: ${products.length}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
