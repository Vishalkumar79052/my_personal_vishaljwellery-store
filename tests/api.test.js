process.env.NODE_ENV = "test";
process.env.DISABLE_REMOTE_PROXY = "true";
process.env.JWT_SECRET = "test_jwt_secret_min_32_characters_long_12345";

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../backend/server.js";

describe("Vishal Jewellery Store — Automated Integration Test Suite", () => {
  let server;
  let baseUrl = "";
  let adminToken = "";
  let userToken = "";
  let demoProductId = "";

  before(async () => {
    try {
      await new Promise((resolve, reject) => {
        server = app.listen(0, "127.0.0.1", (err) => {
          if (err) return reject(err);
          const port = server.address().port;
          baseUrl = `http://127.0.0.1:${port}`;
          resolve();
        });
      });

      // 1. Authenticate Admin demo account
      const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "vishalcse340@gmail.com", password: "vishal123" }),
      });
      const adminData = await adminRes.json();
      assert.equal(adminRes.status, 200, `Admin login should return 200: ${JSON.stringify(adminData)}`);
      assert.ok(adminData.token, "Admin login should provide JWT token");
      assert.equal(adminData.user.role, "admin");
      adminToken = adminData.token;

      // 2. Authenticate User demo account
      const userRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com", password: "user1234" }),
      });
      const userData = await userRes.json();
      assert.equal(userRes.status, 200, `User login should return 200: ${JSON.stringify(userData)}`);
      assert.ok(userData.token, "User login should provide JWT token");
      assert.equal(userData.user.role, "user");
      userToken = userData.token;
    } catch (e) {
      console.error("BEFORE HOOK CAUGHT ERROR:", e.message, e.stack);
      throw e;
    }
  });

  after(() => {
    if (server) server.close();
  });

  describe("1. System Health & Infrastructure", () => {
    it("GET /api/health should return ok and db status", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, "ok");
      assert.ok(data.db, "Health should include db status");
    });
  });

  describe("2. Product Catalog & Search", () => {
    it("GET /api/products should return paginated jewellery pieces", async () => {
      const res = await fetch(`${baseUrl}/api/products?limit=8`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.products));
      assert.ok(data.products.length > 0);
      demoProductId = data.products[0]._id;
    });

    it("GET /api/products/categories should return jewellery categories", async () => {
      const res = await fetch(`${baseUrl}/api/products/categories`);
      assert.equal(res.status, 200);
      const categories = await res.json();
      assert.ok(Array.isArray(categories));
      assert.ok(categories.length > 0);
    });

    it("GET /api/products/:id should retrieve a single jewellery item", async () => {
      assert.ok(demoProductId);
      const res = await fetch(`${baseUrl}/api/products/${demoProductId}`);
      assert.equal(res.status, 200);
      const product = await res.json();
      assert.equal(product._id, demoProductId);
      assert.ok(product.name);
      assert.ok(product.price);
    });

    it("GET /api/products/unknown_id should return 404 cleanly", async () => {
      const res = await fetch(`${baseUrl}/api/products/66d8e0000000000000000999`);
      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.message, "Product not found");
    });

    it("GET /api/products?keyword=Diamond should search products", async () => {
      const res = await fetch(`${baseUrl}/api/products?keyword=Diamond`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.products));
    });
  });

  describe("3. Authentication & Profile", () => {
    it("POST /api/auth/login should reject incorrect password with 401", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com", password: "wrong-password" }),
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.message, "Invalid email or password");
    });

    it("GET /api/auth/profile should reject unauthenticated requests with 401", async () => {
      const res = await fetch(`${baseUrl}/api/auth/profile`);
      assert.equal(res.status, 401);
    });

    it("GET /api/auth/profile should return user details with valid JWT", async () => {
      const res = await fetch(`${baseUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.equal(res.status, 200);
      const profile = await res.json();
      assert.equal(profile.email, "user@example.com");
      assert.equal(profile.password, undefined);
    });
  });

  describe("4. Shopping Cart Lifecycle", () => {
    it("POST /api/cart should add an item to the cart", async () => {
      assert.ok(demoProductId);
      const res = await fetch(`${baseUrl}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ productId: demoProductId, quantity: 1 }),
      });
      assert.equal(res.status, 201);
      const cart = await res.json();
      assert.ok(Array.isArray(cart));
      const found = cart.find((i) => {
        const id = i.product?._id || i.product;
        return String(id) === String(demoProductId);
      });
      assert.ok(found, "Item should exist in returned cart");
    });

    it("PUT /api/cart/:productId should update quantity in cart", async () => {
      const res = await fetch(`${baseUrl}/api/cart/${demoProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ quantity: 3 }),
      });
      assert.equal(res.status, 200);
      const cart = await res.json();
      assert.ok(Array.isArray(cart));
    });

    it("DELETE /api/cart/:productId should remove item from cart", async () => {
      const res = await fetch(`${baseUrl}/api/cart/${demoProductId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.equal(res.status, 200);
      const cart = await res.json();
      const remaining = cart.find((i) => {
        const id = i.product?._id || i.product;
        return String(id) === String(demoProductId);
      });
      assert.equal(remaining, undefined);
    });
  });

  describe("5. Admin Management & Cloud Media Uploads", () => {
    it("GET /api/admin/stats should reject regular customers with 403", async () => {
      const res = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.equal(res.status, 403);
    });

    it("GET /api/admin/stats should return analytics for admin", async () => {
      const res = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const stats = await res.json();
      assert.ok("totalRevenue" in stats, "stats should include totalRevenue");
      assert.ok("orderCount" in stats, "stats should include orderCount");
      assert.ok("userCount" in stats, "stats should include userCount");
      assert.ok("productCount" in stats, "stats should include productCount");
    });

    it("GET /api/admin/upload/status should return Cloudinary active status", async () => {
      const res = await fetch(`${baseUrl}/api/admin/upload/status`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const status = await res.json();
      assert.equal(status.cloudinaryConfigured, true, "Cloudinary should be configured");
      assert.equal(status.cloudName, "itepncom", "Cloud name should match configured account");
      assert.equal(status.provider, "cloudinary");
    });

    it("POST /api/admin/upload should upload product image to Cloudinary CDN", async () => {
      const formData = new FormData();
      const samplePng = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      const blob = new Blob([samplePng], { type: "image/png" });
      formData.append("image", blob, "solitaire-ring.png");

      const res = await fetch(`${baseUrl}/api/admin/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.url, "Should return an image URL");
      assert.equal(data.provider, "cloudinary", "Should upload to Cloudinary");
      assert.ok(data.url.includes("cloudinary.com"), "URL should be a Cloudinary CDN link");
    });
  });
});
