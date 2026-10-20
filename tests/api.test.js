process.env.NODE_ENV = "test";
process.env.DISABLE_REMOTE_PROXY = "true";
process.env.JWT_SECRET = "test_jwt_secret_min_32_characters_long_12345";

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../backend/server.js";
import { computeOrderTimeline } from "../frontend/src/utils/orderTimeline.js";

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

    it("GET /api/admin/users should return users with order stats", async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const users = await res.json();
      assert.ok(Array.isArray(users));
      if (users.length > 0) {
        assert.ok("orderCount" in users[0], "User should contain orderCount");
        assert.ok("totalSpent" in users[0], "User should contain totalSpent");
      }
    });

    it("PUT /api/admin/products/:id/stock should update stock with validation", async () => {
      const res = await fetch(`${baseUrl}/api/admin/products/${demoProductId}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ stock: 15 }),
      });
      assert.equal(res.status, 200);
      const updated = await res.json();
      assert.equal(updated.stock, 15);

      // Validation check: negative stock should be rejected
      const invalidRes = await fetch(`${baseUrl}/api/admin/products/${demoProductId}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ stock: -5 }),
      });
      assert.equal(invalidRes.status, 400);
    });
  });

  describe("6. Order Progress Timeline Synchronization & Milestone Verification", () => {
    it("should show ONLY Order Placed as completed for pending orders", () => {
      const pendingOrder = {
        _id: "6ad67116c2c69ddd5b9f6a23",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const timeline = computeOrderTimeline(pendingOrder);
      assert.equal(timeline.length, 4);

      // Stage 1: Order Placed
      assert.equal(timeline[0].key, "placed");
      assert.equal(timeline[0].isCompleted, true, "Order Placed MUST be completed");
      assert.equal(timeline[0].isActive, false);

      // Stage 2: Preparation
      assert.equal(timeline[1].key, "processing");
      assert.equal(timeline[1].isCompleted, false, "Preparation MUST NOT be complete for pending order");
      assert.equal(timeline[1].isPending, true);

      // Stage 3: Dispatch
      assert.equal(timeline[2].key, "shipped");
      assert.equal(timeline[2].isCompleted, false, "Dispatch MUST NOT be complete for pending order");
      assert.equal(timeline[2].isPending, true);

      // Stage 4: Delivered
      assert.equal(timeline[3].key, "delivered");
      assert.equal(timeline[3].isCompleted, false, "Delivered MUST NOT be complete for pending order");
      assert.equal(timeline[3].isPending, true);

      const completedStages = timeline.filter((s) => s.isCompleted);
      assert.equal(completedStages.length, 1, "Only 1 completed stage must exist for pending order");
    });

    it("should mark preparation as in-progress and NOT complete for processing orders", () => {
      const processingOrder = {
        _id: "6ad67116c2c69ddd5b9f6a23",
        status: "processing",
        createdAt: new Date().toISOString(),
        processingAt: new Date().toISOString(),
      };

      const timeline = computeOrderTimeline(processingOrder);
      assert.equal(timeline[0].isCompleted, true);
      assert.equal(timeline[1].isCompleted, false, "Preparation is in progress, not complete");
      assert.equal(timeline[1].isActive, true, "Preparation is active");
      assert.equal(timeline[2].isCompleted, false);
      assert.equal(timeline[3].isCompleted, false);
    });

    it("should NOT mark dispatch as complete for shipped orders without tracking data", () => {
      const shippedWithoutTracking = {
        _id: "6ad67116c2c69ddd5b9f6a23",
        status: "shipped",
        trackingNumber: "",
        carrier: "",
        createdAt: new Date().toISOString(),
      };

      const timeline = computeOrderTimeline(shippedWithoutTracking);
      assert.equal(timeline[0].isCompleted, true);
      assert.equal(timeline[1].isCompleted, true, "Preparation completed before shipment");
      assert.equal(timeline[2].isCompleted, false, "Dispatch MUST NOT be complete without tracking data");
      assert.equal(timeline[2].isActive, true, "Dispatch is awaiting tracking");
      assert.equal(timeline[3].isCompleted, false);
    });

    it("should mark dispatch as complete when supported by both shipped status AND tracking data", () => {
      const shippedWithTracking = {
        _id: "6ad67116c2c69ddd5b9f6a23",
        status: "shipped",
        trackingNumber: "TRK-BOUTIQUE-88392",
        carrier: "Insured Armoured Logistics",
        createdAt: new Date().toISOString(),
        shippedAt: new Date().toISOString(),
      };

      const timeline = computeOrderTimeline(shippedWithTracking);
      assert.equal(timeline[0].isCompleted, true);
      assert.equal(timeline[1].isCompleted, true);
      assert.equal(timeline[2].isCompleted, true, "Dispatch is complete with tracking data");
      assert.equal(timeline[3].isCompleted, false, "Delivery is out for delivery, not complete");
      assert.equal(timeline[3].isActive, true);
    });

    it("should mark delivery as complete only when status is delivered", () => {
      const deliveredOrder = {
        _id: "6ad67116c2c69ddd5b9f6a23",
        status: "delivered",
        trackingNumber: "TRK-BOUTIQUE-88392",
        carrier: "Insured Armoured Logistics",
        createdAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
      };

      const timeline = computeOrderTimeline(deliveredOrder);
      assert.equal(timeline[0].isCompleted, true);
      assert.equal(timeline[1].isCompleted, true);
      assert.equal(timeline[2].isCompleted, true);
      assert.equal(timeline[3].isCompleted, true, "Delivery is complete for delivered status");
      const completedStages = timeline.filter((s) => s.isCompleted);
      assert.equal(completedStages.length, 4);
    });

    it("PUT /api/admin/orders/:id/status should synchronize milestones and return updated tracking", async () => {
      // Find an order
      const ordersRes = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(ordersRes.status, 200);
      const orders = await ordersRes.json();
      if (orders.length > 0) {
        let targetOrder = orders.find((o) => o.status !== "cancelled");
        if (!targetOrder) {
          await fetch(`${baseUrl}/api/admin/orders/${orders[0]._id}/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ status: "pending" }),
          });
          targetOrder = orders[0];
        }

        // Advance to shipped with tracking number
        const updateRes = await fetch(`${baseUrl}/api/admin/orders/${targetOrder._id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            status: "shipped",
            trackingNumber: "TRK-TEST-77192",
            carrier: "BlueDart Armoured Express",
          }),
        });

        assert.equal(updateRes.status, 200);
        const updated = await updateRes.json();
        assert.equal(updated.status, "shipped");
        assert.equal(updated.trackingNumber, "TRK-TEST-77192");
        assert.equal(updated.carrier, "BlueDart Armoured Express");

        // Verify timeline calculation on updated order
        const timeline = computeOrderTimeline(updated);
        assert.equal(timeline[2].isCompleted, true);
        assert.equal(timeline[3].isCompleted, false);
      }
    });

    it("should handle confirmed order status correctly in timeline", () => {
      const confirmedOrder = {
        _id: "6ad67116c2c69ddd5b9f6a23",
        status: "confirmed",
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
      };

      const timeline = computeOrderTimeline(confirmedOrder);
      assert.equal(timeline[0].isCompleted, true);
      assert.equal(timeline[0].statusText, "Confirmed by Atelier");
      assert.equal(timeline[1].isCompleted, false);
      assert.equal(timeline[1].isPending, true);
      assert.equal(timeline[2].isCompleted, false);
      assert.equal(timeline[3].isCompleted, false);
    });

    it("PUT /api/admin/orders/:id/status should reject transitioning a cancelled order to delivered", async () => {
      const ordersRes = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const orders = await ordersRes.json();
      if (orders.length > 0) {
        const order = orders[0];

        // Cancel order first
        await fetch(`${baseUrl}/api/admin/orders/${order._id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: "cancelled" }),
        });

        // Try transitioning directly to delivered - MUST BE REJECTED with 400
        const invalidTransitionRes = await fetch(`${baseUrl}/api/admin/orders/${order._id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: "delivered" }),
        });

        assert.equal(invalidTransitionRes.status, 400);
        const data = await invalidTransitionRes.json();
        assert.ok(data.message.includes("cancelled"), "Should explain why transition was rejected");

        // Re-open order to pending to maintain database cleanliness for repeatable tests
        await fetch(`${baseUrl}/api/admin/orders/${order._id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: "pending" }),
        });
      }
    });

    it("PUT /api/admin/orders/:id/status should update payment status independently from fulfillment", async () => {
      const ordersRes = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const orders = await ordersRes.json();
      if (orders.length > 0) {
        const order = orders[0];

        // Mark as paid
        const payRes = await fetch(`${baseUrl}/api/admin/orders/${order._id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ isPaid: true }),
        });
        assert.equal(payRes.status, 200);
        const paidOrder = await payRes.json();
        assert.equal(paidOrder.isPaid, true);

        // Mark as unpaid
        const unpayRes = await fetch(`${baseUrl}/api/admin/orders/${order._id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ isPaid: false }),
        });
        assert.equal(unpayRes.status, 200);
        const unpaidOrder = await unpayRes.json();
        assert.equal(unpaidOrder.isPaid, false);
      }
    });
  });
});

