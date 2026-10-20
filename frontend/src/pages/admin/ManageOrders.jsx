import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios.js";
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  Printer,
  Eye,
  RefreshCw,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Layers,
} from "../../components/icons/LucideIcons.jsx";
import OrderProgressTimeline from "../../components/OrderProgressTimeline.jsx";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const statusBadgeStyles = {
  pending: "bg-amber-50 text-amber-800 border-amber-200/80 focus:ring-amber-400",
  confirmed: "bg-teal-50 text-teal-800 border-teal-200/80 focus:ring-teal-400",
  processing: "bg-blue-50 text-blue-800 border-blue-200/80 focus:ring-blue-400",
  shipped: "bg-purple-50 text-purple-800 border-purple-200/80 focus:ring-purple-400",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200/80 focus:ring-emerald-400",
  cancelled: "bg-red-50 text-red-800 border-red-200/80 focus:ring-red-400",
};

const ManageOrders = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [dateFilter, setDateFilter] = useState("all"); // 'all' | 'today' | '7d' | '30d'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'amount_high' | 'amount_low'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  // Status Change Confirmation Modal
  const [confirmModal, setConfirmModal] = useState(null); // { orderId, targetStatus, orderNumber, notes }
  const [adminNote, setAdminNote] = useState("");

  // Tracking inputs inside manifest modal
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
      setErrorNotice("");
    } catch (err) {
      console.warn("Failed to load orders:", err.message);
      setErrorNotice("Could not load customer orders from server.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) setSearchTerm(urlSearch);
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentFilter, searchTerm, dateFilter, sortBy]);

  const handleStatusChange = async (id, status, tracking = {}, notes = "") => {
    setUpdatingId(id);
    try {
      const payload = { status, ...tracking, notes };
      const res = await api.put(`/admin/orders/${id}/status`, payload);
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder(res.data);
      }
      setNotice(`Order #${id.slice(-6).toUpperCase()} status updated to ${status.toUpperCase()}.`);
      setErrorNotice("");
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Could not update order status");
      setTimeout(() => setErrorNotice(""), 4500);
    } finally {
      setUpdatingId(null);
      setConfirmModal(null);
      setAdminNote("");
    }
  };

  const promptStatusChange = (id, targetStatus, orderNumber) => {
    const criticalStatuses = ["cancelled", "delivered", "confirmed"];
    if (criticalStatuses.includes(targetStatus)) {
      setConfirmModal({
        orderId: id,
        targetStatus,
        orderNumber: orderNumber || id.slice(-8).toUpperCase(),
      });
      setAdminNote("");
    } else {
      handleStatusChange(id, targetStatus);
    }
  };

  const handleTogglePayment = async (orderId, currentPaidStatus) => {
    setUpdatingId(orderId);
    try {
      const newStatus = !currentPaidStatus;
      const res = await api.put(`/admin/orders/${orderId}/status`, { isPaid: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.data);
      }
      setNotice(`Order #${orderId.slice(-6).toUpperCase()} payment marked as ${newStatus ? "PAID" : "UNPAID"}.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || "Failed to update payment status");
      setTimeout(() => setErrorNotice(""), 4500);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    await handleStatusChange(selectedOrder._id, selectedOrder.status, {
      trackingNumber,
      carrier,
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesPayment =
        paymentFilter === "all"
          ? true
          : paymentFilter === "paid"
          ? o.isPaid === true
          : o.isPaid === false;

      // Date filtering
      let matchesDate = true;
      if (dateFilter === "today") {
        const orderDate = new Date(o.createdAt).toDateString();
        matchesDate = orderDate === new Date().toDateString();
      } else if (dateFilter === "7d") {
        matchesDate = new Date(o.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === "30d") {
        matchesDate = new Date(o.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q) ||
        o.trackingNumber?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q));

      return matchesStatus && matchesPayment && matchesDate && matchesSearch;
    });
  }, [orders, statusFilter, paymentFilter, dateFilter, searchTerm]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "amount_high") return (b.totalPrice || 0) - (a.totalPrice || 0);
      if (sortBy === "amount_low") return (a.totalPrice || 0) - (b.totalPrice || 0);
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });
  }, [filteredOrders, sortBy]);

  const totalPages = Math.ceil(sortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const statusCounts = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const counts = { all: safeOrders.length };
    statuses.forEach((s) => {
      counts[s] = safeOrders.filter((o) => o?.status === s).length;
    });
    return counts;
  }, [orders]);

  const totalFilteredVolume = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Order Fulfillment Center
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredOrders.length} orders
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage every customer order, verify items, dispatch parcels with tracking, and monitor live progress milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-700 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs">
            Volume: ${totalFilteredVolume.toFixed(2)}
          </span>
          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="text-emerald-700 font-semibold hover:text-emerald-950">
            Dismiss
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice("")} className="text-rose-700 font-semibold hover:text-rose-950">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft space-y-4">
        {/* Status Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === "all"
                ? "bg-emerald-900 text-amber-100 font-semibold shadow-xs"
                : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            All Orders ({statusCounts.all})
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-emerald-900 text-amber-100 font-semibold shadow-xs"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {s} ({statusCounts[s] || 0})
            </button>
          ))}
        </div>

        {/* Search, Payment, Date & Sorting Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search order ID, customer name, email, SKU, tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid & Verified</option>
              <option value="unpaid">Unpaid / COD Pending</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount_high">Sort: Highest Amount</option>
              <option value="amount_low">Sort: Lowest Amount</option>
            </select>

            {/* Items Per Page */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
              title="Rows per page"
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-800 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Retrieving order manifests across all patrons...</p>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900">No Orders Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchTerm
                ? `No customer orders match your query "${searchTerm}".`
                : "No customer orders correspond to the active filter settings."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-stone-200/80 text-stone-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Order ID</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Jewellery Items</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Payment Status</th>
                  <th className="py-3 px-5">Total</th>
                  <th className="py-3 px-5">Fulfilment Workflow</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Order ID & Tracking */}
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-stone-900 block">
                        #{o._id.slice(-8).toUpperCase()}
                      </span>
                      {o.trackingNumber ? (
                        <span className="text-[10px] text-purple-700 block font-mono">
                          AWB: {o.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 block font-mono">
                          No AWB yet
                        </span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-stone-900">
                        {o.user?.name || o.shippingAddress?.fullName || "Guest Client"}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate max-w-[170px]">
                        {o.user?.email || "—"}
                      </p>
                      {o.shippingAddress?.city && (
                        <p className="text-[10px] text-stone-400">
                          {o.shippingAddress.city}, {o.shippingAddress.country || "IN"}
                        </p>
                      )}
                    </td>

                    {/* Jewellery Items Thumbnails Preview */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 overflow-hidden">
                          {o.items?.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100"}
                              alt={item.name}
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-stone-100 shrink-0"
                              title={`${item.name} (${item.quantity ?? item.qty ?? 1}x)`}
                            />
                          ))}
                        </div>
                        <div className="text-[11px] text-stone-600 truncate max-w-[160px]">
                          <span className="font-medium text-stone-900">
                            {o.items?.[0]?.name || "Jewellery"}
                          </span>
                          {o.items?.length > 1 && (
                            <span className="text-[10px] text-stone-400 block">
                              +{o.items.length - 1} other {o.items.length - 1 === 1 ? "piece" : "pieces"}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 text-stone-600 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Payment Status & Toggle */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-1">
                        <button
                          onClick={() => handleTogglePayment(o._id, o.isPaid)}
                          disabled={updatingId === o._id}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-transform hover:scale-105 active:scale-95 ${
                            o.isPaid
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                          title="Click to toggle payment status"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>{o.isPaid ? "Paid & Verified" : "Payment Pending"}</span>
                        </button>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider block">
                          Method: {o.paymentMethod || "cod"}
                        </p>
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="py-3.5 px-5 font-display font-bold text-sm text-stone-900 whitespace-nowrap">
                      ${o.totalPrice?.toFixed(2)}
                    </td>

                    {/* Fulfillment Status Selector */}
                    <td className="py-3.5 px-5">
                      <div className="inline-block relative">
                        <select
                          value={o.status}
                          disabled={updatingId === o._id}
                          onChange={(e) => promptStatusChange(o._id, e.target.value, o._id.slice(-8).toUpperCase())}
                          className={`text-[11px] font-semibold rounded-full px-3 py-1 border appearance-none pr-7 cursor-pointer transition-colors ${
                            statusBadgeStyles[o.status] || "bg-stone-100 text-stone-800"
                          } ${updatingId === o._id ? "opacity-50" : ""}`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-500">
                          ▼
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setTrackingNumber(o.trackingNumber || "");
                          setCarrier(o.carrier || "");
                        }}
                        className="btn-secondary !text-[11px] !py-1 !px-2.5 inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manifest</span>
                      </button>
                      <button
                        onClick={() => setInvoiceOrder(o)}
                        className="text-stone-600 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100 transition-colors inline-block align-middle"
                        title="Print / View Official Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {sortedOrders.length > 0 && (
          <div className="p-4 bg-[#FAF9F6] border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <div>
              Showing{" "}
              <strong className="text-stone-800">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-stone-800">
                {Math.min(currentPage * pageSize, sortedOrders.length)}
              </strong>{" "}
              of <strong className="text-stone-800">{sortedOrders.length}</strong> customer orders
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <span key={page} className="flex items-center">
                        {showEllipsis && <span className="px-1 text-stone-400">…</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-xl text-xs font-semibold transition-colors ${
                            currentPage === page
                              ? "bg-emerald-900 text-amber-100"
                              : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors inline-flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Transition Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-stone-200 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmModal.targetStatus === "cancelled"
                    ? "bg-rose-100 text-rose-700"
                    : confirmModal.targetStatus === "delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-teal-100 text-teal-800"
                }`}
              >
                {confirmModal.targetStatus === "cancelled" ? (
                  <XCircle className="w-6 h-6 stroke-[2.2]" />
                ) : confirmModal.targetStatus === "delivered" ? (
                  <CheckCircle className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <Sparkles className="w-6 h-6 stroke-[2.2]" />
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-stone-900">
                  Confirm Status Transition
                </h3>
                <p className="text-xs text-stone-500">
                  Order #{confirmModal.orderNumber}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you wish to advance this order to{" "}
              <strong className="text-stone-900 uppercase font-bold">
                {confirmModal.targetStatus}
              </strong>
              ? This milestone will be persisted in MongoDB, recorded in the audit trail, and reflected on the customer's order tracking page.
            </p>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Audit Trail / Concierge Notes (Optional):
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Confirmed with client by phone; allocated to master setting atelier"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="btn-secondary !text-xs !py-2"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatusChange(
                    confirmModal.orderId,
                    confirmModal.targetStatus,
                    {},
                    adminNote
                  )
                }
                className={`!text-xs !py-2 !px-4 rounded-xl font-semibold text-white transition-colors ${
                  confirmModal.targetStatus === "cancelled"
                    ? "bg-rose-700 hover:bg-rose-800"
                    : "bg-emerald-900 hover:bg-emerald-800 text-amber-100"
                }`}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Order Manifest Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-stone-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                    Customer Manifest
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-500">
                    Ordered on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-stone-900 mt-0.5">
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-[11px] text-stone-400 font-mono">
                  Database ID: {selectedOrder._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Live Progress Timeline */}
            <OrderProgressTimeline order={selectedOrder} />

            {/* Customer & Delivery Address Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/70 space-y-1">
                <p className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Customer Credentials</span>
                </p>
                <p className="text-stone-800 font-medium">
                  {selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || "Patron Client"}
                </p>
                <p className="text-stone-500">{selectedOrder.user?.email || "No email on record"}</p>
                {selectedOrder.shippingAddress?.phone && (
                  <p className="text-stone-500">Tel: {selectedOrder.shippingAddress.phone}</p>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/70 space-y-1">
                <p className="font-bold text-stone-900">Delivery Address</p>
                <p className="text-stone-800">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-stone-500">{selectedOrder.shippingAddress?.line1}</p>
                {selectedOrder.shippingAddress?.line2 && (
                  <p className="text-stone-500">{selectedOrder.shippingAddress.line2}</p>
                )}
                <p className="text-stone-500">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{" "}
                  {selectedOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-stone-400 text-[10px] uppercase font-semibold">
                  {selectedOrder.shippingAddress?.country || "Domestic Vault Delivery"}
                </p>
              </div>
            </div>

            {/* Workflow Action Controller (Admin Controls) */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                  Fulfillment Status & Permitted Actions
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    statusBadgeStyles[selectedOrder.status] || "bg-stone-100 text-stone-800"
                  }`}
                >
                  Current: {selectedOrder.status}
                </span>
              </div>

              {/* Action buttons based on order status */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedOrder.status === "pending" && (
                  <>
                    <button
                      onClick={() => promptStatusChange(selectedOrder._id, "confirmed", selectedOrder._id.slice(-8).toUpperCase())}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-teal-100 font-semibold text-xs transition-colors"
                    >
                      ✓ Confirm Order
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id, "processing")}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-100 font-semibold text-xs transition-colors"
                    >
                      Start Preparation
                    </button>
                    <button
                      onClick={() => promptStatusChange(selectedOrder._id, "cancelled", selectedOrder._id.slice(-8).toUpperCase())}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id, "processing")}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-100 font-semibold text-xs transition-colors"
                    >
                      Move to Atelier Preparation
                    </button>
                    <button
                      onClick={() => promptStatusChange(selectedOrder._id, "cancelled", selectedOrder._id.slice(-8).toUpperCase())}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.status === "processing" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id, "shipped", { trackingNumber, carrier })}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-100 font-semibold text-xs transition-colors"
                    >
                      Dispatch into Insured Logistics
                    </button>
                    <button
                      onClick={() => promptStatusChange(selectedOrder._id, "cancelled", selectedOrder._id.slice(-8).toUpperCase())}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.status === "shipped" && (
                  <button
                    onClick={() => promptStatusChange(selectedOrder._id, "delivered", selectedOrder._id.slice(-8).toUpperCase())}
                    className="px-4 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors"
                  >
                    🏆 Mark Handed to Patron & Signed (Delivered)
                  </button>
                )}

                {selectedOrder.status === "delivered" && (
                  <span className="text-emerald-900 font-semibold text-xs">
                    ✓ Final delivery successfully completed. Tamper-evident receipt acknowledged.
                  </span>
                )}

                {selectedOrder.status === "cancelled" && (
                  <span className="text-rose-800 font-semibold text-xs">
                    ✕ Order is cancelled. Fulfillment operations have terminated.
                  </span>
                )}
              </div>
            </div>

            {/* Payment Management Box (Independent from fulfillment) */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-stone-900">Payment Status & Settlement</p>
                <p className="text-stone-500 mt-0.5">
                  Method: <strong className="text-stone-800 uppercase">{selectedOrder.paymentMethod || "COD"}</strong> ·{" "}
                  Status:{" "}
                  <strong className={selectedOrder.isPaid ? "text-emerald-800" : "text-amber-800"}>
                    {selectedOrder.isPaid ? "Paid & Reconciled" : "Payment Pending / COD Collection"}
                  </strong>
                </p>
              </div>

              <button
                onClick={() => handleTogglePayment(selectedOrder._id, selectedOrder.isPaid)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors shadow-2xs ${
                  selectedOrder.isPaid
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-900"
                    : "bg-emerald-900 hover:bg-emerald-800 text-amber-100"
                }`}
              >
                {selectedOrder.isPaid ? "Mark as Pending / Unpaid" : "✓ Mark as Paid & Verified"}
              </button>
            </div>

            {/* Ordered Items Manifest Table */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Selected Jewellery Items ({selectedOrder.items?.length || 0})
              </p>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
                          SKU: {item.sku || "VSH-JWL-ORIGINAL"} · Qty: {item.quantity ?? item.qty ?? 1} × ${(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-display font-bold text-stone-900 shrink-0">
                      ${((item.price || 0) * (item.quantity ?? item.qty ?? 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Tracking Number Entry */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/70 space-y-2 text-xs">
              <p className="font-bold text-stone-900">Shipment Logistics & Waybill Tracking</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5 font-medium">Logistics Carrier</label>
                  <input
                    type="text"
                    placeholder="e.g. BlueDart Armoured, FedEx Secure, Brink's"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5 font-medium">Tracking Number (AWB)</label>
                  <input
                    type="text"
                    placeholder="e.g. TRK-9840291"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white font-mono focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveTracking}
                className="btn-secondary !text-[11px] !py-1 !px-3 mt-1 inline-flex items-center gap-1 shadow-2xs"
              >
                <Truck className="w-3 h-3 text-purple-700" />
                <span>Save Tracking Details</span>
              </button>
            </div>

            {/* Audit Trail / Status History */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/70 space-y-2 text-xs">
                <p className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Status Milestone Audit Trail</span>
                </p>
                <div className="space-y-1.5 divide-y divide-stone-100">
                  {selectedOrder.statusHistory.map((h, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2 text-[11px]">
                      <div>
                        <span className="font-semibold text-stone-800 capitalize">{h.status}</span>
                        <span className="text-stone-400"> — {h.adminName || "Administrator"}</span>
                        {h.notes && <p className="text-[10px] text-stone-500 mt-0.5 italic">{h.notes}</p>}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                        {new Date(h.changedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-stone-100">
              <div className="flex justify-between text-stone-500">
                <span>Items Subtotal</span>
                <span>${selectedOrder.itemsPrice?.toFixed(2) || selectedOrder.totalPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Insured Valuables Shipping</span>
                <span>${selectedOrder.shippingPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Tax & Customs (Estimated)</span>
                <span>${selectedOrder.taxPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-base text-stone-900 pt-1.5 border-t border-stone-100">
                <span>Total Acquisition Cost</span>
                <span>${selectedOrder.totalPrice?.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions inside modal */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setInvoiceOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="btn-secondary !text-xs !py-2 inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-primary !text-xs !py-2"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Dialog */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 print:p-0 print:border-0 print:shadow-none">
            {/* Action Bar (hidden when printing) */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 print:hidden">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Official Jewellery Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-primary !text-xs !py-2 inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:text-stone-900 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-emerald-950">Vishal Jewellery Store</h2>
                <p className="text-xs text-amber-800 font-semibold tracking-wider uppercase mt-0.5">
                  Haute Joaillerie & Solitaires
                </p>
                <p className="text-[11px] text-stone-500 mt-1">contact@vishaljewellery.com | Certified Luxury</p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-stone-900">INVOICE</p>
                <p className="font-mono text-xs text-stone-500 mt-0.5">
                  #{invoiceOrder._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Billed To / Shipped To */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200 text-xs">
              <div>
                <p className="font-bold text-stone-900 mb-1">Billed To:</p>
                <p className="text-stone-800 font-medium">{invoiceOrder.user?.name || "Customer"}</p>
                <p className="text-stone-500">{invoiceOrder.user?.email}</p>
              </div>
              <div>
                <p className="font-bold text-stone-900 mb-1">Ship To:</p>
                <p className="text-stone-800 font-medium">{invoiceOrder.shippingAddress?.fullName}</p>
                <p className="text-stone-500">{invoiceOrder.shippingAddress?.line1}</p>
                <p className="text-stone-500">
                  {invoiceOrder.shippingAddress?.city}, {invoiceOrder.shippingAddress?.postalCode}
                </p>
                {invoiceOrder.shippingAddress?.phone && (
                  <p className="text-stone-500">Tel: {invoiceOrder.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs">
              <thead className="border-b-2 border-stone-200 font-bold text-stone-900">
                <tr>
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoiceOrder.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 pr-2">
                      <p className="font-semibold text-stone-900">{item.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        SKU: {item.sku || "VSH-JWL-AUTHENTIC"} · Hallmarked & Certified
                      </p>
                    </td>
                    <td className="py-3 text-center">{item.quantity ?? item.qty ?? 1}</td>
                    <td className="py-3 text-right font-medium">${(item.price || 0).toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-stone-900">
                      ${((item.price || 0) * (item.quantity ?? item.qty ?? 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Calculations */}
            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal:</span>
                  <span>${invoiceOrder.itemsPrice?.toFixed(2) || invoiceOrder.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Insured Shipping:</span>
                  <span>${invoiceOrder.shippingPrice?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between font-display font-bold text-base text-emerald-950 pt-2 border-t border-stone-200">
                  <span>Total Due:</span>
                  <span>${invoiceOrder.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="pt-2 text-[10px] text-stone-400 text-right">
                  Payment Status: <strong className="text-stone-700 capitalize">{invoiceOrder.isPaid ? "Paid & Reconciled" : "Cash on Delivery (Pending)"}</strong>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-stone-100 text-center text-[10px] text-stone-400">
              <p>Thank you for choosing Vishal Jewellery Store. Each piece is hallmarked, conflict-free, and certified for purity.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
