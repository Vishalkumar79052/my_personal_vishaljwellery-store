import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Plus,
  Boxes,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from "../../components/icons/LucideIcons.jsx";

const StatCard = ({ label, value, subtext, icon: Icon, trend, accent = "emerald" }) => {
  const accentThemes = {
    emerald: {
      bg: "bg-emerald-50/80 text-emerald-900 border-emerald-200/60",
      pill: "bg-emerald-100/70 text-emerald-800",
      iconBg: "bg-emerald-900 text-amber-200",
    },
    amber: {
      bg: "bg-amber-50/80 text-amber-900 border-amber-200/60",
      pill: "bg-amber-100/70 text-amber-800",
      iconBg: "bg-amber-700 text-white",
    },
    blue: {
      bg: "bg-blue-50/80 text-blue-900 border-blue-200/60",
      pill: "bg-blue-100/70 text-blue-800",
      iconBg: "bg-blue-900 text-white",
    },
    stone: {
      bg: "bg-stone-50 text-stone-900 border-stone-200/60",
      pill: "bg-stone-100 text-stone-800",
      iconBg: "bg-stone-800 text-white",
    },
  };

  const theme = accentThemes[accent] || accentThemes.emerald;

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{label}</span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-stone-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${theme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center text-xs font-semibold text-emerald-800">
          <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = (range = timeRange) => {
    setLoading(true);
    api
      .get(`/admin/stats?range=${range}`)
      .then((res) => {
        setStats(res.data);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load dashboard statistics");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStats(timeRange);
  }, [timeRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(timeRange);
  };

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center max-w-md mx-auto my-12 border border-red-200 shadow-soft">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-display text-xl text-stone-900 font-bold mb-2">Dashboard Error</h3>
        <p className="text-xs text-stone-600 mb-6">{error}</p>
        <button onClick={() => fetchStats(timeRange)} className="btn-primary !text-xs !py-2.5">
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-stone-200/60 rounded-2xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-stone-200/50 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-stone-200/40 rounded-3xl" />
          <div className="h-72 bg-stone-200/40 rounded-3xl" />
        </div>
      </div>
    );
  }

  const aov = stats.orderCount > 0 ? (stats.totalRevenue / stats.orderCount).toFixed(2) : "0.00";
  const salesByDay = stats.salesByDay || [];
  const maxDayRevenue = Math.max(...salesByDay.map((d) => d.total), 1);
  const rangeTotal = salesByDay.reduce((sum, d) => sum + d.total, 0);

  const statusIcons = {
    pending: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    confirmed: <CheckCircle className="w-3.5 h-3.5 text-teal-600" />,
    processing: <Sparkles className="w-3.5 h-3.5 text-blue-600" />,
    shipped: <Truck className="w-3.5 h-3.5 text-purple-600" />,
    delivered: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
    cancelled: <XCircle className="w-3.5 h-3.5 text-red-600" />,
  };

  const statusColors = {
    delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
    shipped: "bg-purple-50 text-purple-800 border-purple-200",
    processing: "bg-blue-50 text-blue-800 border-blue-200",
    confirmed: "bg-teal-50 text-teal-800 border-teal-200",
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    cancelled: "bg-red-50 text-red-800 border-red-200",
  };

  const orderCounts = stats.orderStatusCounts || {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Executive Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Boutique Store
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time sales velocity, jewellery inventory levels, and order fulfillment metrics.
          </p>
        </div>

        {/* Quick Range Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="bg-white border border-stone-200 rounded-2xl p-1 flex items-center shadow-xs">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "1y", label: "Year" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-xl transition-colors ${
                  timeRange === r.id
                    ? "bg-emerald-900 text-amber-100 font-semibold shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 shadow-xs transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <Link
            to="/admin/products"
            className="btn-primary !px-3.5 !py-1.5 text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Jewellery</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gross Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          subtext={`Avg order volume: $${aov}`}
          trend="Store volume tracked"
          accent="emerald"
          icon={DollarSign}
        />
        <StatCard
          label="Total Orders"
          value={stats.orderCount}
          subtext={`${orderCounts.pending} pending / ${orderCounts.processing} in progress`}
          trend="Fulfillment pipeline active"
          accent="blue"
          icon={ShoppingCart}
        />
        <StatCard
          label="Jewellery Catalog"
          value={stats.productCount}
          subtext={`${stats.lowStockCount || 0} low stock / ${stats.outOfStockCount || 0} out`}
          trend="Cloudinary CDN hosted"
          accent="amber"
          icon={Package}
        />
        <StatCard
          label="Registered Clients"
          value={stats.userCount}
          subtext="Verified customer accounts"
          accent="stone"
          icon={Users}
        />
      </div>

      {/* Order Status Pipeline Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Order Fulfillment Pipeline
          </span>
          <Link to="/admin/orders" className="text-xs font-semibold text-emerald-800 hover:underline">
            Manage all orders →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: "pending", label: "Pending", count: orderCounts.pending, bg: "bg-amber-50 text-amber-900 border-amber-200" },
            { key: "confirmed", label: "Confirmed", count: orderCounts.confirmed || 0, bg: "bg-teal-50 text-teal-900 border-teal-200" },
            { key: "processing", label: "Processing", count: orderCounts.processing, bg: "bg-blue-50 text-blue-900 border-blue-200" },
            { key: "shipped", label: "Shipped", count: orderCounts.shipped, bg: "bg-purple-50 text-purple-900 border-purple-200" },
            { key: "delivered", label: "Delivered", count: orderCounts.delivered, bg: "bg-emerald-50 text-emerald-900 border-emerald-200" },
            { key: "cancelled", label: "Cancelled", count: orderCounts.cancelled, bg: "bg-red-50 text-red-900 border-red-200" },
          ].map((item) => (
            <div key={item.key} className={`p-3 rounded-2xl border ${item.bg} flex items-center justify-between`}>
              <div>
                <p className="text-[11px] font-semibold opacity-75">{item.label}</p>
                <p className="font-display text-xl font-bold mt-0.5">{item.count}</p>
              </div>
              <div className="p-2 rounded-xl bg-white/70 shadow-2xs">
                {statusIcons[item.key]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Velocity Chart & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Velocity Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900">Revenue Velocity</h2>
                <p className="text-xs text-stone-500">Sales performance over selected period ({timeRange})</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-400 block uppercase">Period Volume</span>
                <p className="font-display text-xl font-bold text-emerald-950">${rangeTotal.toFixed(2)}</p>
              </div>
            </div>

            {salesByDay.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-xs text-stone-400 bg-[#FAF9F6] rounded-2xl border border-dashed border-stone-200">
                <p>No orders recorded in this time range.</p>
                <p className="text-[11px] text-stone-400 mt-1">New customer checkouts will plot automatically here.</p>
              </div>
            ) : (
              <div className="h-52 flex items-end gap-2 pt-6 pb-2 px-1">
                {salesByDay.map((day) => {
                  const heightPercent = Math.max(10, Math.round((day.total / maxDayRevenue) * 100));
                  const dateLabel = new Date(day._id + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div key={day._id} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-12 bg-stone-900 text-amber-100 text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap z-20 shadow-md">
                        ${day.total.toFixed(2)} ({day.count} {day.count === 1 ? "order" : "orders"})
                      </div>
                      {/* Bar */}
                      <div className="w-full bg-stone-100 rounded-t-xl h-40 flex items-end overflow-hidden">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-emerald-900 via-emerald-700 to-emerald-500 rounded-t-xl transition-all duration-500 group-hover:from-emerald-950 group-hover:to-amber-500"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-stone-500 truncate max-w-full">
                        {dateLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 mt-4 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700 inline-block" />
              Real customer transactions
            </span>
            <span>Range: {stats.days} days</span>
          </div>
        </div>

        {/* Best-Selling Jewellery Pieces (1 Column) */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-stone-900">Best Sellers</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Top Pieces
              </span>
            </div>

            {(!stats.bestSellers || stats.bestSellers.length === 0) ? (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-stone-400 bg-[#FAF9F6] rounded-2xl border border-dashed border-stone-200">
                <p>No sales history recorded yet.</p>
                <p className="text-[11px] text-stone-400 mt-1">Best-performing pieces will rank here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.bestSellers.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/60 flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.unitsSold} units sold (${item.revenue?.toFixed(2) || "0.00"})
                      </p>
                    </div>
                    <span className="font-display text-xs font-bold text-emerald-900 shrink-0">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100">
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center justify-between"
            >
              <span>Explore full catalog</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders & Stock Watch Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">Recent Orders</h2>
              <p className="text-xs text-stone-500">Latest customer acquisitions & transactions</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-emerald-800 hover:underline">
              View all orders →
            </Link>
          </div>

          {(!Array.isArray(stats?.recentOrders) || stats.recentOrders.length === 0) ? (
            <p className="text-xs text-stone-400 py-10 text-center">No orders registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-medium">
                    <th className="py-2.5 pr-4">Order ID</th>
                    <th className="py-2.5 pr-4">Customer</th>
                    <th className="py-2.5 pr-4">Payment</th>
                    <th className="py-2.5 pr-4">Amount</th>
                    <th className="py-2.5 pr-4">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {(Array.isArray(stats.recentOrders) ? stats.recentOrders : []).map((o) => (
                    <tr key={o._id} className="hover:bg-stone-50/60 transition-colors">

                      <td className="py-3 pr-4 font-mono font-semibold text-stone-900">
                        #{o._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-stone-900">{o.user?.name || "Customer"}</p>
                        <p className="text-[11px] text-stone-400 truncate max-w-[140px]">{o.user?.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            o.isPaid
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {o.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-stone-900">
                        ${o.totalPrice?.toFixed(2)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border capitalize ${
                            statusColors[o.status] || "bg-stone-100 text-stone-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders?search=${o._id.slice(-6)}`}
                          className="text-xs font-semibold text-emerald-800 hover:underline"
                        >
                          Manifest
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inventory Stock Watch (1 Column) */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900">Stock Watch</h2>
                <p className="text-xs text-stone-500">Low & out-of-stock jewellery alerts</p>
              </div>
              <Link to="/admin/inventory" className="text-xs font-semibold text-emerald-800 hover:underline">
                Inventory →
              </Link>
            </div>

            {(!Array.isArray(stats?.lowStock) || stats.lowStock.length === 0) && (!Array.isArray(stats?.outOfStockList) || stats.outOfStockList.length === 0) ? (
              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-emerald-950">Inventory Healthy</p>
                <p className="text-[11px] text-emerald-700">All jewellery items have sufficient stock units.</p>
              </div>
            ) : (

              <div className="space-y-2.5">
                {/* Out of Stock Alerts */}
                {stats.outOfStockList?.map((p) => (
                  <div key={p._id} className="p-2.5 rounded-2xl bg-red-50/60 border border-red-200 flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-red-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-500">{p.category || "Jewellery"}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 shrink-0">
                      Out of stock
                    </span>
                  </div>
                ))}

                {/* Low Stock Items */}
                {stats.lowStock.map((p) => (
                  <div key={p._id} className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-amber-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-500">{p.category || "Jewellery"}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-stone-100">
            <Link
              to="/admin/inventory"
              className="btn-secondary w-full text-xs text-center !py-2 block"
            >
              Open Stock Adjustment Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
