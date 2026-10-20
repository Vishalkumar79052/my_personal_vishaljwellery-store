import mongoose from "mongoose";
import dotenv from "dotenv";
import { JEWELLERY_PRODUCTS } from "../config/initialProducts.js";

dotenv.config();

const syncCatalog = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not configured in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    // Remove legacy generic non-jewellery fixtures
    const legacyNames = [
      "Solstice Running Shoes",
      "Aurora Wireless Headphones",
      "Fable Linen Throw Blanket",
      "Terra Canvas Backpack",
      "Meridian Ceramic Mug Set",
      "Nomad Stainless Water Bottle",
      "A",
    ];

    const delResult = await db.collection("products").deleteMany({
      name: { $in: legacyNames },
    });
    console.log(`[Catalog Sync] Removed ${delResult.deletedCount} legacy demo products.`);

    // Upsert authentic luxury jewellery catalog items
    let inserted = 0;
    for (const item of JEWELLERY_PRODUCTS) {
      const objId = new mongoose.Types.ObjectId(item._id);
      const exists = await db.collection("products").findOne({ _id: objId });
      if (!exists) {
        await db.collection("products").insertOne({
          ...item,
          _id: objId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        inserted++;
      } else {
        await db.collection("products").updateOne(
          { _id: objId },
          {
            $set: {
              name: item.name,
              category: item.category,
              price: item.price,
              description: item.description,
              image: item.image,
              stock: item.stock,
              isFeatured: item.isFeatured,
              isActive: item.isActive,
              sku: item.sku,
            },
          }
        );
      }
    }
    console.log(`[Catalog Sync] Inserted ${inserted} new jewellery pieces; synchronized ${JEWELLERY_PRODUCTS.length} total pieces.`);

    const count = await db.collection("products").countDocuments();
    console.log(`[Catalog Sync] Current active jewellery products in database: ${count}`);

    await mongoose.disconnect();
    console.log("[Catalog Sync] Complete.");
  } catch (err) {
    console.error("[Catalog Sync Error]:", err);
    process.exit(1);
  }
};

syncCatalog();
