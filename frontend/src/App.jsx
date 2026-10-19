import { Routes, Route } from "react-router-dom";
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

import UserDashboardLayout from "./pages/user/UserDashboardLayout.jsx";
import Overview from "./pages/user/Overview.jsx";
import Orders from "./pages/user/Orders.jsx";
import OrderDetail from "./pages/user/OrderDetail.jsx";
import Profile from "./pages/user/Profile.jsx";

import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import ManageProducts from "./pages/admin/ManageProducts.jsx";
import ManageOrders from "./pages/admin/ManageOrders.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<UserDashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="users" element={<ManageUsers />} />
            </Route>
          </Route>

          <Route path="*" element={<div className="max-w-3xl mx-auto px-6 py-24 text-center">Page not found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
