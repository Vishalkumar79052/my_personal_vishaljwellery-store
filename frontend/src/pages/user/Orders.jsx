import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useCart } from "../../context/CartContext.jsx";
import {
  ShoppingCart,
  Package,
  Search,
  Filter,
  ArrowRight,
  RotateCcw,
  XCircle,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "../../components/icons/LucideIcons.jsx";
import OrderProgressTimeline from "../../components/OrderProgressTimeline.jsx";

const statusBadges = {
  pending: {
    label: "Awaiting Confirmation",
    bg: "bg-amber-50 text-amber-900 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  processing: {
    label: "In Atelier Preparation",
    bg: "bg-blue-50 text-blue-900 border-blue-200",
    dot: "bg-blue-500",
    icon: Package,
  },
  shipped: {
    label: "Dispatched & In Transit",
    bg: "bg-purple-50 text-purple-900 border-purple-200",
    dot: "bg-purple-500",
    icon: Truck,
  },
  delivered: {
    label: "Delivered to Vault/Address",
    bg: "bg-emerald-50 text-emerald-900 border-emerald-200",
    dot: "bg-emerald-600",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Order Cancelled",
    bg: "bg-rose-50 text-rose-900 border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

const filterTabs = [
  { id: "all", label: "All Orders" },
  { id: "processing", label: "Processing & Pending" },
  { id: "shipped", label: "In Transit" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [reordering, setReordering] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/my");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load customer orders:", err);
      setOrders([]);
      setActionError("Could not retrieve your orders. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setCancellingId(orderToCancel._id);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await api.put(`/orders/${orderToCancel._id}/cancel`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderToCancel._id ? { ...o, status: "cancelled" } : o))
      );
      setActionSuccess(`Order #${orderToCancel._id.slice(-8).toUpperCase()} was successfully cancelled.`);
      setOrderToCancel(null);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to cancel order. Please reach out to our concierge."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = async (order) => {
    setReordering(order._id);
    setActionSuccess("");
    setActionError("");

    try {
      for (const item of order.items) {
        if (item.product) {
          const productId = typeof item.product === "object" ? item.product._id : item.product;
          await addToCart(productId, item.quantity || 1);
        }
      }
      setActionSuccess("All available jewels have been added to your shopping bag.");
      setTimeout(() => {
        navigate("/cart");
      }, 1200);
    } catch (err) {
      setActionError("Could not add items to cart. Some creations may be out of stock.");
    } finally {
      setReordering(null);
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = safeOrders.filter((order) => {
    if (!order) return false;

    // Tab filter
    if (activeTab === "processing") {
      if (order.status !== "pending" && order.status !== "processing") return false;
    } else if (activeTab === "shipped") {
      if (order.status !== "shipped") return false;
    } else if (activeTab === "delivered") {
      if (order.status !== "delivered") return false;
    } else if (activeTab === "cancelled") {
      if (order.status !== "cancelled") return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const orderIdMatch = order._id ? order._id.toLowerCase().includes(q) : false;
    const itemMatch = Array.isArray(order.items) ? order.items.some((i) => i.name?.toLowerCase().includes(q)) : false;
    const trackingMatch = order.trackingNumber ? order.trackingNumber.toLowerCase().includes(q) : false;

    return orderIdMatch || itemMatch || trackingMatch;
  });


  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
            Order Archive & Tracking
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-stone-900 mt-1 font-bold">
            My Jewellery Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review detailed manifests, track vault dispatch, reorder past treasures, or request assistance.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Explore Collections</span>
        </Link>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess("")}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError("")}
            className="text-rose-700 hover:text-rose-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Tabs Filter */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-900 text-amber-100 shadow-2xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Jewel name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List Container */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-36 h-4 bg-stone-200 rounded-full" />
                <div className="w-24 h-4 bg-stone-200 rounded-full" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-stone-200 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="w-48 h-3 bg-stone-200 rounded-full" />
                  <div className="w-24 h-3 bg-stone-200 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8 stroke-1 text-emerald-900" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900">
              {orders.length === 0 ? "No jewellery orders placed yet" : "No orders matching your criteria"}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              {orders.length === 0
                ? "Every acquisition from Vishal Jewellery Store is accompanied by a certificate of authenticity and insured door-to-door delivery."
                : "Try adjusting your search terms or status filter tab to locate your order record."}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Explore High Jewellery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const badge = statusBadges[order.status] || statusBadges.pending;
            const BadgeIcon = badge.icon;
            const canCancel = order.status === "pending" || order.status === "processing";

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden transition-all hover:border-amber-300/60"
              >
                {/* Order Top Bar */}
                <div className="p-5 sm:px-6 bg-[#FAF9F6]/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                        Order Placed
                      </span>
                      <span className="font-semibold text-stone-800">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                        Total Amount
                      </span>
                      <span className="font-display font-bold text-stone-900">
                        ${order.totalPrice?.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                        Dispatched To
                      </span>
                      <span className="font-medium text-stone-700 truncate max-w-[120px] block">
                        {order.shippingAddress?.fullName || "Recipient"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                        Payment
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.isPaid ? "Paid & Verified" : "Payment Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-semibold text-stone-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-4 py-2 border-b border-stone-50 last:border-0"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80"}
                            alt={item.name}
                            className="w-14 h-14 rounded-2xl object-cover bg-stone-100 border border-stone-200/60 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-display font-semibold text-sm text-stone-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              Quantity: {item.quantity} · Price: ${item.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <span className="font-display font-bold text-sm text-stone-900 shrink-0">
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Courier & Tracking note if available */}
                  {order.trackingNumber && (
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-purple-700" />
                        <span className="font-medium text-stone-700">
                          Carrier: <strong className="text-stone-900">{order.carrier || "Boutique Secure Vault Logistics"}</strong>
                        </span>
                        <span className="text-stone-400">|</span>
                        <span className="font-mono text-stone-800">AWB: {order.trackingNumber}</span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
                        Insured Transit
                      </span>
                    </div>
                  )}

                  {/* Synchronized Order Progress Timeline */}
                  <OrderProgressTimeline order={order} compact={true} />

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/user/dashboard/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-100 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <span>View Order Details & Invoice</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleReorder(order)}
                        disabled={reordering === order._id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium transition-colors"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${reordering === order._id ? "animate-spin" : ""}`} />
                        <span>{reordering === order._id ? "Adding Jewels…" : "Reorder"}</span>
                      </button>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => setOrderToCancel(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200/80 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-stone-900">
                Cancel Order #{orderToCancel._id.slice(-8).toUpperCase()}?
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                Are you sure you wish to cancel this acquisition? Atelier preparation will cease immediately and reserved pieces will be returned to store availability.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1 text-stone-700">
              <div className="flex justify-between">
                <span>Total Refundable Value:</span>
                <span className="font-bold text-stone-900">${orderToCancel.totalPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{orderToCancel.items?.length || 0} jewellery piece(s)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancellingId === orderToCancel._id}
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {cancellingId === orderToCancel._id ? "Cancelling…" : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
