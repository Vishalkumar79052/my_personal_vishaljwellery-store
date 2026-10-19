import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const StatCard = ({ label, value, subtext, icon, trend, accent = "forest" }) => {
  const accentStyles = {
    forest: "bg-forest-50 text-forest-800 border-forest-200/60",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    amber: "bg-amber-50 text-amber-800 border-amber-200/60",
    blue: "bg-blue-50 text-blue-800 border-blue-200/60",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-forest-100 shadow-soft hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-forest-700/70 tracking-wide uppercase">{label}</p>
          <p className="font-display text-3xl text-ink mt-2">{value}</p>
          {subtext && <p className="text-xs text-forest-700/60 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${accentStyles[accent]}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-forest-50 flex items-center text-xs font-medium text-emerald-700">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {trend}
        </div>
      )}
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    api
      .get("/admin/stats")
      .then((res) => {
        setStats(res.data);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load dashboard statistics");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto my-12 border border-red-200">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-800 font-semibold mb-2">{error}</p>
        <p className="text-xs text-forest-700/60 mb-6">
          Please ensure you are signed in with an administrator account to access this console.
        </p>
        <button onClick={fetchStats} className="btn-secondary !text-xs !py-2">
          Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-sand/60 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-sand/40 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-sand/30 rounded-2xl" />
      </div>
    );
  }

  const aov = stats.orderCount > 0 ? (stats.totalRevenue / stats.orderCount).toFixed(2) : "0.00";

  // Calculate 7-day revenue metrics
  const salesByDay = stats.salesByDay || [];
  const maxDayRevenue = Math.max(...salesByDay.map((d) => d.total), 1);
  const sevenDayTotal = salesByDay.reduce((sum, d) => sum + d.total, 0);

  const statusColors = {
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-8">
      {/* Executive Welcome & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-forest-100">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl text-forest-900">Executive Dashboard</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Online
            </span>
          </div>
          <p className="text-forest-700/60 text-sm mt-1">
            Real-time performance, inventory levels, and order management for Vishal Jewellery Store.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/products"
            className="btn-primary !px-4 !py-2 text-xs inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Jewellery
          </Link>
          <Link
            to="/shop"
            className="btn-secondary !px-4 !py-2 text-xs inline-flex items-center gap-1.5"
            target="_blank"
            rel="noreferrer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Storefront
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Gross Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          subtext="Lifetime store volume"
          trend="+18.4% growth"
          accent="emerald"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={stats.orderCount}
          subtext={`Avg. value: $${aov}`}
          trend="Order pipeline active"
          accent="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard
          label="Active Customers"
          value={stats.userCount}
          subtext="Registered client accounts"
          accent="forest"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="Jewellery Catalog"
          value={stats.productCount}
          subtext={`${stats.lowStock.length} items low stock`}
          accent="amber"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      </div>

      {/* 7-Day Revenue Analytics & Cloud Media Storage Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Revenue Bars (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-forest-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-ink">Revenue Velocity</h2>
              <p className="text-xs text-forest-700/60 mt-0.5">Last 7 days sales performance</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-forest-700/60">7-Day Total:</span>
              <p className="font-display text-lg text-forest-900">${sevenDayTotal.toFixed(2)}</p>
            </div>
          </div>

          {salesByDay.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-xs text-forest-700/50 bg-forest-50/40 rounded-2xl border border-dashed border-forest-100">
              <p>No transactions recorded in the last 7 days.</p>
              <p className="text-[11px] text-forest-700/40 mt-1">Live sales will graph automatically here.</p>
            </div>
          ) : (
            <div className="h-48 flex items-end gap-3 pt-6 pb-2 px-2">
              {salesByDay.map((day) => {
                const heightPercent = Math.max(12, Math.round((day.total / maxDayRevenue) * 100));
                const dateLabel = new Date(day._id + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <div key={day._id} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-12 bg-ink text-white text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap z-20 shadow-md">
                      ${day.total.toFixed(2)} ({day.count} {day.count === 1 ? "order" : "orders"})
                    </div>
                    {/* Bar */}
                    <div className="w-full bg-forest-100 rounded-t-xl h-36 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-forest-700 to-forest-500 rounded-t-xl transition-all duration-500 group-hover:from-forest-800 group-hover:to-forest-600"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-forest-700">{dateLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cloud Media Storage Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink">Cloud Media Hub</h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-forest-700/70 mb-5 leading-relaxed">
              Automated Cloudinary CDN image streaming active for the luxury jewellery catalog.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-forest-50/70 border border-forest-100 flex items-center justify-between">
                <span className="text-forest-700/80">Provider:</span>
                <span className="font-semibold text-forest-900">Cloudinary CDN</span>
              </div>
              <div className="p-3 rounded-xl bg-forest-50/70 border border-forest-100 flex items-center justify-between">
                <span className="text-forest-700/80">Cloud Name:</span>
                <span className="font-mono font-medium text-forest-900">itepncom</span>
              </div>
              <div className="p-3 rounded-xl bg-forest-50/70 border border-forest-100 flex items-center justify-between">
                <span className="text-forest-700/80">Folder:</span>
                <span className="font-mono text-[11px] text-forest-900">vishal-jewellery-products</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-forest-100">
            <Link
              to="/admin/products"
              className="btn-secondary w-full text-xs text-center !py-2.5 block"
            >
              Upload New Media File
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-forest-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-ink">Recent Orders</h2>
              <p className="text-xs text-forest-700/60 mt-0.5">Latest customer transactions</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-forest-700 hover:text-forest-900 underline">
              View all orders →
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="text-xs text-forest-700/60 py-8 text-center">No orders registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-forest-100 text-forest-700/60">
                    <th className="py-2.5 pr-4 font-medium">Order ID</th>
                    <th className="py-2.5 pr-4 font-medium">Customer</th>
                    <th className="py-2.5 pr-4 font-medium">Date</th>
                    <th className="py-2.5 pr-4 font-medium">Amount</th>
                    <th className="py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-50">
                  {stats.recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-forest-50/30 transition-colors">
                      <td className="py-3 pr-4 font-mono font-medium text-forest-900">
                        #{o._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-ink">{o.user?.name || "Customer"}</p>
                        <p className="text-[11px] text-forest-700/60 truncate max-w-[150px]">{o.user?.email}</p>
                      </td>
                      <td className="py-3 pr-4 text-forest-700/70">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4 font-medium text-ink">
                        ${o.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium border capitalize ${statusColors[o.status] || "bg-sand text-forest-800 border-forest-200"}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 Column) */}
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-ink">Stock Watch</h2>
              <p className="text-xs text-forest-700/60 mt-0.5">Pieces with ≤ 5 units remaining</p>
            </div>
            <Link to="/admin/products" className="text-xs font-semibold text-forest-700 hover:text-forest-900 underline">
              Inventory →
            </Link>
          </div>

          {stats.lowStock.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-emerald-900">Inventory Healthy</p>
              <p className="text-[11px] text-emerald-700/70">No pieces currently running low on stock.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((p) => (
                <div key={p._id} className="p-3 rounded-2xl bg-forest-50/40 border border-forest-100 flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover border border-forest-100 bg-sand/30 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700 shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                    <p className="text-[11px] text-forest-700/60">{p.category || "Jewellery"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                      {p.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
