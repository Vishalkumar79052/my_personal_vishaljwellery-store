# Vishal — Full-Stack E-commerce App

A complete e-commerce application with a customer-facing storefront, a user dashboard, and an admin dashboard.

**Stack:** React (Vite) + Tailwind CSS on the frontend, Node.js/Express + MongoDB (Mongoose) on the backend, JWT authentication.

## Features

**Storefront**
- Product browsing with search, category filter, sorting, and pagination
- Product detail pages with reviews/ratings
- Cart and checkout with shipping address + order summary
- Register / login (JWT-based auth)

**User dashboard** (`/dashboard`)
- Order history and order detail pages
- Editable profile and default shipping address

**Admin dashboard** (`/admin`)
- Stats overview (revenue, orders, customers, low-stock alerts)
- Product management (create / edit / delete)
- Order management (view all orders, update status)
- User management (activate/deactivate, delete)

## Project structure

```
ecommerce-app/
  backend/     Express API (MongoDB via Mongoose, JWT auth)
  frontend/    React app (Vite + Tailwind CSS)
```

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set `MONGO_URI` to your MongoDB connection string (local MongoDB, or a free MongoDB Atlas cluster), and set a strong `JWT_SECRET`.

Seed the database with demo data (an admin account, a demo user, and sample products):

```bash
npm run seed
```

Start the API server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the backend automatically (see `vite.config.js`).



## Notes

- Passwords are hashed with bcrypt; auth uses JWTs stored in `localStorage` on the client.
- Cart is stored server-side per user, so it persists across devices/sessions.
- Checkout is a simple "cash on delivery / card" flow (no real payment gateway wired up) — this is the natural place to plug in Stripe or another provider if you need real payments.
- To deploy: host the backend (Render, Railway, Fly.io, etc.) with a MongoDB Atlas database, and host the frontend build (`npm run build` → `dist/`) on Vercel, Netlify, or similar. Update `CLIENT_URL` in the backend `.env` and the API base URL on the frontend accordingly.
