import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const statusColor = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-forest-100 text-forest-700",
  cancelled: "bg-red-100 text-red-700",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">My orders</h1>

      {loading ? (
        <p className="text-forest-700/60 text-sm">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-forest-700/60 text-sm">
          No orders yet.{" "}
          <Link to="/shop" className="underline text-forest-700">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/dashboard/orders/${o._id}`}
              className="card p-4 flex flex-wrap items-center justify-between gap-3 hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-sm">#{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-forest-700/50">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)
                </p>
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

export default Orders;
