import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColor = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-forest-100 text-forest-700",
  cancelled: "bg-red-100 text-red-700",
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () =>
    api
      .get("/admin/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.warn("Failed to load orders:", err.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Orders</h1>

      {loading ? (
        <p className="text-forest-700/60 text-sm">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-forest-700/60 border-b border-forest-100">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-forest-50">
                  <td className="py-3 pr-4 font-medium">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 pr-4 text-forest-700/70">
                    {o.user?.name}
                    <br />
                    <span className="text-xs">{o.user?.email}</span>
                  </td>
                  <td className="py-3 pr-4 text-forest-700/70">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">${o.totalPrice.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className={`text-xs rounded-full px-3 py-1.5 border-0 capitalize ${statusColor[o.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
