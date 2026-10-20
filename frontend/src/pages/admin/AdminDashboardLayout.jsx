import { useState } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Store,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Settings,
} from "../../components/icons/LucideIcons.jsx";

const navLinks = [
  {
    to: "/admin",
    label: "Overview",
    end: true,
    icon: LayoutDashboard,
    badge: null,
  },
  {
    to: "/admin/products",
    label: "Jewellery Catalog",
    icon: Package,
    badge: null,
  },
  {
    to: "/admin/orders",
    label: "Order Manifests",
    icon: ShoppingCart,
    badge: null,
  },
  {
    to: "/admin/inventory",
    label: "Inventory & Stock",
    icon: Boxes,
    badge: "Live",
  },
  {
    to: "/admin/categories",
    label: "Categories",
    icon: Layers,
    badge: null,
  },
  {
    to: "/admin/users",
    label: "Customer Accounts",
    icon: Users,
    badge: null,
  },
  {
    to: "/admin/settings",
    label: "Boutique Settings",
    icon: Settings,
    badge: null,
  },
];

const AdminDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    const term = globalSearch.trim();
    // Intelligently route search term to products or orders
    if (term.startsWith("#") || term.toLowerCase().startsWith("ord-")) {
      navigate(`/admin/orders?search=${encodeURIComponent(term.replace("#", ""))}`);
    } else {
      navigate(`/admin/products?search=${encodeURIComponent(term)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2421] flex flex-col font-sans">
      {/* Top Luxury Executive Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200/80 shadow-xs">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-700 text-amber-300 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-lg tracking-tight text-emerald-950 font-semibold block leading-tight">
                  Vishal Jewellery
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-700 block">
                  Executive Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar */}
          <form onSubmit={handleGlobalSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search jewellery, SKU, order ID (#)..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-[#F4F1EA]/60 border border-stone-200 rounded-full pl-10 pr-4 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all"
              />
              <svg
                className="w-4 h-4 text-stone-400 absolute left-3.5 top-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Right: Actions, Storefront Link, Admin Badge & Logout */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors shadow-2xs"
              title="Return to Vishal Jewellery Storefront"
            >
              <Store className="w-3.5 h-3.5 text-emerald-800" />
              <span>Storefront</span>
            </Link>

            <div className="h-5 w-px bg-stone-200 hidden sm:block" />

            {/* Admin Avatar & Pill */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-200 font-display text-xs font-bold flex items-center justify-center border border-amber-300/40 shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-stone-900 leading-tight truncate max-w-[120px]">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-emerald-800 font-medium">Boutique Admin</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 gap-6">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ${
            collapsed ? "w-18" : "w-64"
          }`}
        >
          <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-soft sticky top-22 flex flex-col justify-between min-h-[calc(100vh-8rem)]">
            <div>
              {/* Sidebar Header & Collapse Toggle */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 px-2">
                {!collapsed && (
                  <div>
                    <p className="text-[11px] font-semibold tracking-wider text-amber-800 uppercase">Management</p>
                    <p className="font-display text-base text-stone-900 font-bold">Admin Console</p>
                  </div>
                )}
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors ml-auto"
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = link.end
                    ? location.pathname === link.to
                    : location.pathname.startsWith(link.to);

                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      title={collapsed ? link.label : undefined}
                      className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-900 to-emerald-800 text-amber-100 font-semibold shadow-xs border border-emerald-700"
                          : "text-stone-600 hover:text-stone-950 hover:bg-[#F7F5F0]"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-300" : "text-stone-500"}`} />
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span>{link.label}</span>
                          {link.badge && (
                            <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">
                              {link.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Sidebar Box */}
            {!collapsed && (
              <div className="pt-4 border-t border-stone-100 px-2 space-y-2">
                <div className="p-3 rounded-2xl bg-[#F7F5F0] border border-stone-200/60 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-emerald-950 text-[11px]">Cloud Media Live</span>
                  </div>
                  <p className="text-[11px] text-stone-500">Cloudinary CDN synced for high-res jewellery assets.</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-stone-900/50 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-5 shadow-2xl flex flex-col justify-between animate-slide-right">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-stone-900 text-sm">Vishal Jewellery</p>
                      <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Admin Suite</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
                            isActive
                              ? "bg-emerald-900 text-amber-100 font-semibold shadow-xs"
                              : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{link.label}</span>
                        {link.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {link.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
