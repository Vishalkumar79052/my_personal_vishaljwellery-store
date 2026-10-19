import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../../api/axios.js";

const statusColor = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-forest-100 text-forest-700",
  cancelled: "bg-red-100 text-red-700",
};

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <p className="text-forest-700/60 text-sm">Loading…</p>;

  return (
    <div>
      {location.state?.justPlaced && (
        <div className="bg-forest-100 text-forest-800 text-sm px-4 py-3 rounded-xl mb-6">
          Your order has been placed successfully! 🎉
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-forest-700/60">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColor[order.status]}`}>{order.status}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center card p-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-forest-700/50">
                  Qty {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-medium mb-3">Shipping address</h2>
            <p className="text-sm text-forest-700/70 leading-relaxed">
              {order.shippingAddress?.fullName}
              <br />
              {order.shippingAddress?.line1}
              {order.shippingAddress?.line2 && <>, {order.shippingAddress.line2}</>}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              <br />
              {order.shippingAddress?.country}
              <br />
              {order.shippingAddress?.phone}
            </p>
          </div>

          <div className="card p-5 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-forest-700/70">Items</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-700/70">Shipping</span>
              <span>${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-700/70">Tax</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2 border-t border-forest-100 mt-2">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
