import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  ShieldCheck,
  User,
  ShoppingCart,
  Search,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "./icons/LucideIcons.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminActive = location.pathname.startsWith("/admin");
  const isCustomerDashboardActive = location.pathname.startsWith("/user/dashboard") || location.pathname.startsWith("/dashboard");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(query.trim())}`);
      setMobileMenuOpen(false);
    } else {
      navigate("/shop");
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-full bg-emerald-950 text-amber-300 flex items-center justify-center font-display font-bold text-sm border border-amber-300/40 shadow-2xs">
            VJ
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-emerald-950 group-hover:text-amber-800 transition-colors">
              Vishal Jewellery
            </span>
            <span className="text-[9px] tracking-widest uppercase font-semibold text-amber-700 -mt-1 hidden sm:block">
              High Jewellery & Solitaires
            </span>
          </div>
        </Link>

        {/* Global Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search diamonds, rings, necklaces…"
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-stone-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900 transition-all shadow-3xs"
            />
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3 text-xs font-medium">
          <Link
            to="/shop"
            className="px-3 py-1.5 rounded-full text-stone-700 hover:text-emerald-900 hover:bg-stone-100/70 transition-colors"
          >
            Collections
          </Link>

          <Link
            to="/cart"
            className="relative px-3 py-1.5 rounded-full text-stone-700 hover:text-emerald-900 hover:bg-stone-100/70 transition-colors flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-stone-600" />
            <span>Bag</span>
            {itemCount > 0 && (
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-bold rounded-full px-1.5 py-0.2 min-w-4 text-center">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="h-4 w-px bg-stone-300 mx-1" />

          {user ? (
            <div className="flex items-center gap-2.5">
              {/* ADMIN PANEL LINK (When user is admin) */}
              {user.role === "admin" ? (
                <Link
                  to="/admin"
                  id="navbar-admin-dashboard-link"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs ${
                    isAdminActive
                      ? "bg-amber-400 text-emerald-950 ring-2 ring-amber-300"
                      : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80"
                  }`}
                  title="Store Administration & Executive Controls"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                  <span>Admin Panel</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                </Link>
              ) : (
                /* CUSTOMER USER DASHBOARD LINK (For customer patrons) */
                <Link
                  to="/user/dashboard"
                  id="navbar-customer-dashboard-link"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                    isCustomerDashboardActive
                      ? "bg-emerald-900 text-amber-100 shadow-xs"
                      : "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 border border-emerald-200"
                  }`}
                  title="Customer Orders, Wishlist & Addresses"
                >
                  <User className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Customer Dashboard</span>
                </Link>
              )}

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full text-xs text-stone-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                title="Sign out of account"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-700 hover:text-emerald-900 hover:bg-stone-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-900 hover:bg-emerald-800 text-amber-100 transition-colors shadow-xs"
              >
                Join Maison
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/cart"
            className="relative p-2 rounded-xl text-stone-700 hover:bg-stone-100"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-stone-700 hover:bg-stone-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-5 py-4 space-y-4 shadow-xl animate-slide-down">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jewellery catalogue…"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900"
              />
            </div>
          </form>

          {/* Links list */}
          <div className="flex flex-col space-y-2 text-xs font-semibold">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-stone-50 text-stone-800"
            >
              Browse Collections
            </Link>

            {user ? (
              <>
                {/* Role-appropriate Dashboard link on mobile */}
                {user.role === "admin" ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-amber-100 text-amber-950 font-bold border border-amber-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Admin Panel</span>
                    </span>
                    <span className="text-[10px] bg-amber-400 px-2 py-0.5 rounded-full font-bold">
                      Store Admin
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/user/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-emerald-50 text-emerald-950 font-bold border border-emerald-200 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-800" />
                      <span>Customer Dashboard</span>
                    </span>
                    <span className="text-[10px] text-emerald-700">Orders & Profile →</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left p-2.5 rounded-xl text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-stone-200 text-stone-800 hover:bg-stone-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-emerald-900 text-amber-100 font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
