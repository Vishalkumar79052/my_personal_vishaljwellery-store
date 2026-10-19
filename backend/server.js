import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import express from "express";
import "express-async-errors";
import cors from "cors";
import dotenv from "dotenv";
import connectDB, { getDbStatus } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
await connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../frontend");
const distPath = path.resolve(frontendDir, "dist");
const uploadsPath = path.resolve(__dirname, "../uploads");

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Ensure frontend dist exists for static serving
if (!fs.existsSync(distPath) && process.env.NODE_ENV !== "test") {
  console.log("[AI Studio] Building frontend before starting server...");
  try {
    execSync("npm run build --workspace=frontend", { stdio: "inherit" });
  } catch (err) {
    console.warn("[AI Studio] Frontend build failed during startup:", err.message);
  }
}

const app = express();

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

const REMOTE_BACKEND =
  process.env.USE_REMOTE_BACKEND === "true" && process.env.BACKEND_URL
    ? process.env.BACKEND_URL.replace(/\/+$/, "")
    : null;

// Proxy middleware to forward /api requests to an external backend only if explicitly configured
const remoteBackendProxy = async (req, res, next) => {
  if (
    !REMOTE_BACKEND ||
    process.env.NODE_ENV === "test" ||
    process.env.DISABLE_REMOTE_PROXY === "true" ||
    req.path.startsWith("/admin/upload")
  ) {
    return next();
  }

  try {
    const targetUrl = `${REMOTE_BACKEND}${req.originalUrl}`;
    const headers = {};
    if (req.headers.authorization) headers.authorization = req.headers.authorization;
    if (req.headers["content-type"]) headers["content-type"] = req.headers["content-type"];
    if (req.headers.accept) headers.accept = req.headers.accept;
    headers.origin = "http://localhost:5173";

    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
      headers["content-type"] = headers["content-type"] || "application/json";
    }

    const response = await fetch(targetUrl, fetchOptions);

    // If remote backend experiences loop (508), gateway error, or crash, fall back to local handlers
    if (response.status >= 500) {
      console.warn(`[Remote Backend] Received HTTP ${response.status} from ${REMOTE_BACKEND}. Falling back to local Express routes.`);
      return next();
    }

    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("content-type", contentType);
    res.status(response.status);

    if (response.status === 204) {
      return res.end();
    }

    const text = await response.text();
    return res.send(text);
  } catch (err) {
    console.log("[Remote Backend] Fallback to local routes:", err.message);
    next();
  }
};

app.get("/api/health", (req, res) => res.json({ status: "ok", backend: REMOTE_BACKEND || "local", db: getDbStatus() }));

// Route through remote backend proxy if configured, falling back to local handlers
app.use("/api", remoteBackendProxy);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Fallback for unmatched API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Database offline error fallback middleware (as required by AI Studio migration guidelines)
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    (err.message && err.message.includes("buffering timed out"))
  ) {
    console.log("[AI Studio] Database offline — returning fallback response:", err.message);
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res.status(503).json({ error: "Service temporarily unavailable (database offline)" });
  }
  next(err);
});

app.use(errorHandler);

// Serve frontend static assets and SPA fallback
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Wrap async route handlers so thrown errors reach errorHandler
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
});

const PORT = process.env.PORT || 3000;
let server;
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));
}

export { app, server };
export default app;
