import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const statusColor = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-forest-100 text-forest-700",
  cancelled: "bg-red-100 text-red-700",
};

const Overview = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/my").then((res) => setOrders(res.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Welcome back, {user?.name?.split(" ")[0]}</h1>
      <p className="text-forest-700/60 mb-6">Here's a quick look at your recent activity.</p>

      {user?.role === "admin" && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-forest-700/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Administrator Console</span>
            </div>
            <p className="font-display text-lg text-cream">Executive Store Management</p>
            <p className="text-xs text-forest-200/80">Manage the jewellery catalog, fulfill customer orders, review analytics, and monitor Cloudinary CDN storage.</p>
          </div>
          <Link
            to="/admin"
            className="shrink-0 bg-amber-400 hover:bg-amber-300 text-forest-950 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs inline-flex items-center gap-2"
          >
            <span>Open Admin Dashboard</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="card p-5">
          <p className="text-sm text-forest-700/60">Total orders</p>
          <p className="font-display text-3xl">{orders.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-forest-700/60">Total spent</p>
          <p className="font-display text-3xl">
            ${orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <h2 className="font-display text-xl mb-4">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="text-forest-700/60 text-sm">
          No orders yet.{" "}
          <Link to="/shop" className="underline text-forest-700">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 5).map((o) => (
            <Link
              key={o._id}
              to={`/dashboard/orders/${o._id}`}
              className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-sm">#{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-forest-700/50">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColor[o.status]}`}>{o.status}</span>
              <p className="font-medium">${o.totalPrice.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Overview;
