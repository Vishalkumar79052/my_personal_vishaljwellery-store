import { useState } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import {
  LayoutDashboard,
  ShoppingCart,
  Heart,
  MapPin,
  Users,
  HelpCircle,
  Sparkles,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "../../components/icons/LucideIcons.jsx";

const customerLinks = [
  {
    to: "/user/dashboard",
    label: "Account Overview",
    end: true,
    icon: LayoutDashboard,
  },
  {
    to: "/user/dashboard/orders",
    label: "My Orders & Manifests",
    icon: ShoppingCart,
  },
  {
    to: "/user/dashboard/wishlist",
    label: "Saved Jewels & Wishlist",
    icon: Heart,
  },
  {
    to: "/user/dashboard/addresses",
    label: "Delivery Addresses",
    icon: MapPin,
  },
  {
    to: "/user/dashboard/profile",
    label: "Profile & Security",
    icon: Users,
  },
  {
    to: "/user/dashboard/support",
    label: "Concierge & Support",
    icon: HelpCircle,
  },
];

const UserDashboardLayout = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2421] flex flex-col font-sans">
      {/* Admin Executive Switcher Banner (if user is admin) */}
      {user?.role === "admin" && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-amber-200 px-6 py-2.5 text-xs border-b border-amber-400/30 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-amber-300">
              Maison Administrator Session Active
            </span>
            <span className="hidden sm:inline text-amber-100/70">
              — You have full store management permissions.
            </span>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold tracking-wide transition-colors shadow-2xs text-[11px]"
          >
            <span>Switch to Admin Suite</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Mobile Navigation Bar Toggle */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-900 text-amber-200 font-display font-bold flex items-center justify-center text-sm">
              {user?.name?.charAt(0).toUpperCase() || "C"}
            </div>
            <div>
              <p className="font-display font-bold text-sm text-stone-900">{user?.name || "Client"}</p>
              <p className="text-[10px] text-amber-800 font-semibold tracking-wider uppercase">Privileged Patron</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Customer Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-68 shrink-0 space-y-5">
          {/* Patron Card */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-800 text-amber-200 font-display text-lg font-bold flex items-center justify-center border border-amber-300/40 shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display font-bold text-base text-stone-900 truncate">
                    {user?.name?.split(" ")[0]}
                  </h2>
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                </div>
                <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  Maison Patron
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {customerLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.end
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-900 to-emerald-800 text-amber-100 font-semibold shadow-xs border border-emerald-700"
                        : "text-stone-600 hover:text-stone-950 hover:bg-[#F7F5F0]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-300" : "text-stone-400"}`} />
                    <span className="flex-1">{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Storefront Shortcuts */}
            <div className="pt-3 border-t border-stone-100 space-y-1">
              <Link
                to="/shop"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5" />
                  <span>Browse Collections</span>
                </span>
                <span className="text-[11px] text-emerald-700">→</span>
              </Link>

              <Link
                to="/cart"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Shopping Bag</span>
                </span>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-emerald-950">
                    {itemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Boutique Concierge Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#F4EFEA] to-[#ECE5DC] border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <p className="font-display font-bold text-xs text-stone-900">Bespoke Concierge</p>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Seeking custom sizing, certified solitaire consultation, or bridal styling?
            </p>
            <Link
              to="/user/dashboard/support"
              className="text-[11px] font-bold text-emerald-900 hover:underline block pt-1"
            >
              Contact Concierge →
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-stone-950/50 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-5 shadow-2xl flex flex-col justify-between animate-slide-right">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-900 text-amber-200 font-display font-bold flex items-center justify-center">
                      {user?.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div>
                      <p className="font-display font-bold text-stone-900 text-sm">{user?.name || "Client"}</p>
                      <p className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold">
                        Customer Portal
                      </p>
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
                  {customerLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
                            isActive
                              ? "bg-emerald-900 text-amber-100 font-semibold shadow-xs"
                              : "text-stone-700 hover:bg-stone-50"
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{link.label}</span>
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

        {/* Customer Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
