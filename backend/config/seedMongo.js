import User from "../models/User.js";
import Product from "../models/Product.js";
import { JEWELLERY_PRODUCTS } from "./initialProducts.js";

export const autoSeedMongoIfEmpty = async () => {
  try {
    // 1. Ensure Admin User exists
    const adminEmail = "vishalcse340@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log(`[MongoDB] Creating default Admin user: ${adminEmail}...`);
      await User.create({
        name: "Vishal Kumar",
        email: adminEmail,
        password: "vishal123",
        role: "admin",
        isActive: true,
      });
      console.log(`[MongoDB] Admin user ${adminEmail} created successfully.`);
    } else {
      // Ensure existing admin account is active, has admin role, and matches demo credentials
      let needsSave = false;
      if (existingAdmin.role !== "admin" || !existingAdmin.isActive) {
        existingAdmin.role = "admin";
        existingAdmin.isActive = true;
        needsSave = true;
      }
      if (!(await existingAdmin.matchPassword("vishal123"))) {
        existingAdmin.password = "vishal123";
        needsSave = true;
      }
      if (needsSave) {
        await existingAdmin.save();
        console.log(`[MongoDB] Admin user ${adminEmail} role/status/password synchronized.`);
      }
    }

    // 2. Ensure Demo Customer user exists
    const demoEmail = "user@example.com";
    const existingDemoUser = await User.findOne({ email: demoEmail });
    if (!existingDemoUser) {
      await User.create({
        name: "Demo Shopper",
        email: demoEmail,
        password: "user1234",
        role: "user",
        isActive: true,
      });
      console.log(`[MongoDB] Demo shopper user created.`);
    } else if (!existingDemoUser.isActive) {
      existingDemoUser.isActive = true;
      await existingDemoUser.save();
      console.log(`[MongoDB] Demo shopper user reactivated.`);
    }

    // 3. Ensure Products are seeded if collection is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("[MongoDB] Products collection empty — seeding jewellery collection...");
      await Product.insertMany(JEWELLERY_PRODUCTS);
      console.log(`[MongoDB] Successfully seeded ${JEWELLERY_PRODUCTS.length} jewellery products.`);
    }
  } catch (err) {
    console.warn("[MongoDB] Auto-seeding encountered warning:", err.message);
  }
};
