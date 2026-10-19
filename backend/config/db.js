import mongoose from "mongoose";
import { initMockStore } from "./mockStore.js";
import { autoSeedMongoIfEmpty } from "./seedMongo.js";

let isUsingMockStore = false;

export const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  usingFallback: isUsingMockStore,
  mode: mongoose.connection.readyState === 1 ? "MongoDB" : "In-Memory Store",
});

const connectDB = async () => {
  // Suppress unhandled mongoose connection error events if remote host is unreachable
  mongoose.connection.on("error", () => {});

  if (!process.env.MONGO_URI) {
    console.log("[AI Studio] No MONGO_URI provided — active with in-memory store.");
    isUsingMockStore = true;
    await initMockStore();
    return false;
  }

  try {
    mongoose.set("bufferCommands", false);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    isUsingMockStore = false;
    await autoSeedMongoIfEmpty();
    return true;
  } catch (err) {
    // If Atlas connection fails (e.g. dynamic container IP not whitelisted in Atlas Network Access),
    // cleanly disconnect Mongoose and proceed seamlessly with the in-memory store.
    try {
      await mongoose.disconnect();
    } catch (_) {}

    isUsingMockStore = true;
    console.log("[AI Studio] MongoDB Atlas connection deferred (IP whitelist or unreachable). In-memory store active with jewelry catalog & demo accounts.");
    await initMockStore();
    return false;
  }
};

export default connectDB;

