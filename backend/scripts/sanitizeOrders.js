import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Order from "../models/Order.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const orders = await Order.find({});
  for (const o of orders) {
    let changed = false;
    for (const item of o.items) {
      if (item.name && (item.name.includes("Shoes") || item.name.includes("Headphones") || item.name.includes("Sneaker"))) {
        console.log(`Fixing legacy fixture item in order ${o._id}: ${item.name}`);
        item.name = "Solstice Diamond Solitaire Pendant";
        item.image = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";
        item.sku = "VSH-PEN-008";
        changed = true;
      }
      if (item.name === "A") {
        item.name = "Artisan Gold Handcrafted Bangle";
        item.sku = "VSH-BNG-001";
        changed = true;
      }
    }
    if (changed) {
      o.markModified("items");
      await o.save();
      console.log(`Saved sanitized order ${o._id}`);
    }
  }

  const updatedOrders = await Order.find({});
  console.log("All orders sanitized:");
  console.log(JSON.stringify(updatedOrders.map(o => ({
    id: o._id,
    items: o.items.map(i => ({ name: i.name, sku: i.sku, qty: i.quantity, price: i.price }))
  })), null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
