import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  ShoppingCart,
  Heart,
  Truck,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Store,
  MapPin,
  Users,
} from "../../components/icons/LucideIcons.jsx";

const statusColors = {
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  shipped: "bg-purple-50 text-purple-800 border-purple-200",
  processing: "bg-blue-50 text-blue-800 border-blue-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

const Overview = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api
        .get("/orders/my")
        .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
        .catch(() => setOrders([])),
      api
        .get("/auth/wishlist")
        .then((res) => setWishlistCount(Array.isArray(res.data) ? res.data.length : 0))
        .catch(() => setWishlistCount(0)),
    ]).finally(() => setLoading(false));
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalSpent = safeOrders.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);
  const activeOrders = safeOrders.filter((o) => ["pending", "processing", "shipped"].includes(o?.status));
  const deliveredOrders = safeOrders.filter((o) => o?.status === "delivered");


  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-soft border border-emerald-800/60">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maison Vishal Privileged Member</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-cream">
            Welcome back, {user?.name?.split(" ")[0] || "Patron"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Manage your bespoke jewellery orders, monitor insured courier tracking, and access your saved jewellery wishlist.
          </p>

          <div className="pt-3 flex flex-wrap gap-2.5">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-colors shadow-xs"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Explore Creations</span>
            </Link>
            <Link
              to="/user/dashboard/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Track Orders</span>
            </Link>
          </div>
        </div>

        {/* Decorative background ornament */}
        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 rounded-full bg-gradient-to-tr from-amber-400/10 to-emerald-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Customer Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total Purchases</span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{safeOrders.length}</p>
          <p className="text-xs text-stone-500 mt-1">${totalSpent.toFixed(2)} lifetime spend</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Active Shipments</span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{activeOrders.length}</p>
          <p className="text-xs text-stone-500 mt-1">In fulfillment or transit</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Delivered Heirlooms</span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-emerald-950 mt-1">{deliveredOrders.length}</p>
          <p className="text-xs text-stone-500 mt-1">Safely in your care</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Saved in Wishlist</span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-amber-700 mt-1">{wishlistCount}</p>
          <p className="text-xs text-stone-500 mt-1">
            <Link to="/user/dashboard/wishlist" className="underline hover:text-stone-900">
              View saved pieces →
            </Link>
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="font-display font-bold text-lg text-stone-900">Recent Jewellery Orders</h2>
            <p className="text-xs text-stone-500">Track delivery milestones and certified package manifests</p>
          </div>
          <Link
            to="/user/dashboard/orders"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
          >
            All Orders ({safeOrders.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-7 h-7 border-2 border-emerald-300 border-t-emerald-800 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Checking your purchases...</p>
          </div>
        ) : safeOrders.length === 0 ? (
          <div className="p-8 text-center space-y-3 bg-[#FAF9F6] rounded-2xl border border-stone-200/70">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">Begin Your Jewellery Journey</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't placed an order with Vishal Jewellery Store yet. Explore our bespoke solitaires and handcrafted bridal jewelry.
            </p>
            <Link to="/shop" className="btn-primary !text-xs !py-2.5 inline-flex items-center gap-1.5">
              <span>Browse Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {safeOrders.slice(0, 3).map((o) => (

              <div
                key={o._id}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {o.items?.[0]?.image ? (
                      <img src={o.items[0].image} alt="Jewellery" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-900">
                        #{o._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                          statusColors[o.status] || "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 font-medium mt-0.5">
                      {o.items?.[0]?.name || "Bespoke Creation"}
                      {o.items?.length > 1 && ` +${o.items.length - 1} more`}
                    </p>

                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Ordered on {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-stone-200">
                  <div className="text-left sm:text-right">
                    <span className="font-display font-bold text-sm text-stone-900 block">
                      ${o.totalPrice?.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                      {o.isPaid ? "Paid Online" : "Cash on Delivery"}
                    </span>
                  </div>

                  <Link
                    to={`/user/dashboard/orders/${o._id}`}
                    className="btn-secondary !text-xs !py-1.5 !px-3 inline-flex items-center gap-1"
                  >
                    <span>View Manifest</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access Grid: Delivery Address & Security */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/user/dashboard/addresses"
          className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft hover:shadow-md transition-shadow flex items-start gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-sm text-stone-900 group-hover:text-emerald-900 transition-colors">
              Delivery Addresses
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage saved shipping destinations and designated default addresses for checkout.
            </p>
          </div>
        </Link>

        <Link
          to="/user/dashboard/profile"
          className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft hover:shadow-md transition-shadow flex items-start gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors">
              Profile & Security
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Update phone contact, profile information, and change your password securely.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Overview;
