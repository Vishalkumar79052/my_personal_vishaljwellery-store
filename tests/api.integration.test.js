import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../backend/server.js";

describe("Vishal Jewellery Store — API Integration Test Suite", () => {
  let adminToken = "";
  let userToken = "";
  let demoProductId = "";
  let sampleCartProductId = "";

  beforeAll(async () => {
    // Authenticate Admin demo account
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "vishalcse340@gmail.com", password: "vishal123" });

    expect(adminRes.status).toBe(200);
    expect(adminRes.body).toHaveProperty("token");
    expect(adminRes.body.user.role).toBe("admin");
    adminToken = adminRes.body.token;

    // Authenticate User demo account
    const userRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "user1234" });

    expect(userRes.status).toBe(200);
    expect(userRes.body).toHaveProperty("token");
    expect(userRes.body.user.role).toBe("user");
    userToken = userRes.body.token;
  });

  describe("1. System Health & Infrastructure", () => {
    it("GET /api/health should return ok status and database mode", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("db");
      expect(res.body.db).toHaveProperty("mode");
    });
  });

  describe("2. Product Catalog & Discovery", () => {
    it("GET /api/products should return a paginated list of jewellery pieces", async () => {
      const res = await request(app).get("/api/products?limit=8");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty("total");

      // Save a product ID for detail and cart testing
      demoProductId = res.body.products[0]._id;
      sampleCartProductId = res.body.products[0]._id;
    });

    it("GET /api/products/categories should return distinct jewellery categories", async () => {
      const res = await request(app).get("/api/products/categories");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("GET /api/products/:id should return single product details", async () => {
      expect(demoProductId).toBeTruthy();
      const res = await request(app).get(`/api/products/${demoProductId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", demoProductId);
      expect(res.body).toHaveProperty("name");
      expect(res.body).toHaveProperty("price");
    });

    it("GET /api/products/invalid_id should return 404 for unknown product", async () => {
      const res = await request(app).get("/api/products/66d8e0000000000000000999");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Product not found");
    });

    it("GET /api/products?keyword=Diamond should search by keyword", async () => {
      const res = await request(app).get("/api/products?keyword=Diamond");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.products)).toBe(true);
    });
  });

  describe("3. Authentication & User Profile", () => {
    it("POST /api/auth/login should fail with invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "wrong_password" });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
    });

    it("GET /api/auth/profile should fail without bearer token", async () => {
      const res = await request(app).get("/api/auth/profile");
      expect(res.status).toBe(401);
    });

    it("GET /api/auth/profile should return current user info with token", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("email", "user@example.com");
      expect(res.body).not.toHaveProperty("password");
    });
  });

  describe("4. Shopping Cart Lifecycle", () => {
    it("GET /api/cart should require authentication", async () => {
      const res = await request(app).get("/api/cart");
      expect(res.status).toBe(401);
    });

    it("POST /api/cart should add an item to the user cart", async () => {
      expect(sampleCartProductId).toBeTruthy();
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ productId: sampleCartProductId, quantity: 1 });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      const addedItem = res.body.find((item) => {
        const id = item.product?._id || item.product;
        return String(id) === String(sampleCartProductId);
      });
      expect(addedItem).toBeTruthy();
    });

    it("PUT /api/cart/:productId should update item quantity in cart", async () => {
      const res = await request(app)
        .put(`/api/cart/${sampleCartProductId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 2 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("DELETE /api/cart/:productId should remove item from cart", async () => {
      const res = await request(app)
        .delete(`/api/cart/${sampleCartProductId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const remainingItem = res.body.find((item) => {
        const id = item.product?._id || item.product;
        return String(id) === String(sampleCartProductId);
      });
      expect(remainingItem).toBeFalsy();
    });
  });

  describe("5. Admin Management & Cloud Media Uploads", () => {
    it("GET /api/admin/stats should reject non-admin users with 403", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("GET /api/admin/stats should allow admin user and return analytics", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalRevenue");
      expect(res.body).toHaveProperty("orderCount");
      expect(res.body).toHaveProperty("userCount");
      expect(res.body).toHaveProperty("productCount");
    });

    it("GET /api/admin/upload/status should return media storage status", async () => {
      const res = await request(app)
        .get("/api/admin/upload/status")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("cloudinaryConfigured");
      expect(res.body).toHaveProperty("provider");
    });

    it("POST /api/admin/upload should upload an image and return an accessible URL", async () => {
      // 1x1 transparent PNG buffer
      const pngBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );

      const res = await request(app)
        .post("/api/admin/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", pngBuffer, "diamond-ring-sample.png");

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("url");
      expect(typeof res.body.url).toBe("string");
      expect(res.body.url.length).toBeGreaterThan(0);
    });
  });
});
