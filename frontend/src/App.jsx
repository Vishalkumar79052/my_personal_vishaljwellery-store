import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { PrivateRoute, AdminRoute } from "./components/RouteGuards.jsx";

import Home from "./pages/Home.jsx";
import ProductList from "./pages/ProductList.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// Customer User Dashboard Pages
import UserDashboardLayout from "./pages/user/UserDashboardLayout.jsx";
import Overview from "./pages/user/Overview.jsx";
import Orders from "./pages/user/Orders.jsx";
import OrderDetail from "./pages/user/OrderDetail.jsx";
import Addresses from "./pages/user/Addresses.jsx";
import Wishlist from "./pages/user/Wishlist.jsx";
import Profile from "./pages/user/Profile.jsx";
import Support from "./pages/user/Support.jsx";

// Admin Dashboard Pages
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import ManageProducts from "./pages/admin/ManageProducts.jsx";
import ManageOrders from "./pages/admin/ManageOrders.jsx";
import ManageInventory from "./pages/admin/ManageInventory.jsx";
import ManageCategories from "./pages/admin/ManageCategories.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1F2421]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Storefront */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Customer User Dashboard Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Primary Customer Dashboard path */}
            <Route path="/user/dashboard" element={<UserDashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="profile" element={<Profile />} />
              <Route path="support" element={<Support />} />
            </Route>

            {/* Seamless support for /dashboard paths (e.g. /dashboard/orders/:id) */}
            <Route path="/dashboard" element={<UserDashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="profile" element={<Profile />} />
              <Route path="support" element={<Support />} />
            </Route>
          </Route>


          {/* Protected Admin Dashboard Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="inventory" element={<ManageInventory />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="max-w-3xl mx-auto px-6 py-28 text-center space-y-4">
                <h1 className="font-display text-4xl text-stone-900 font-bold">404</h1>
                <p className="text-sm text-stone-500">
                  The requested jewellery gallery or boutique page could not be located.
                </p>
                <div className="pt-2">
                  <a
                    href="/"
                    className="inline-block px-6 py-2.5 rounded-full bg-emerald-900 text-amber-100 text-xs font-semibold"
                  >
                    Return to Storefront
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
