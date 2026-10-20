import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Package,
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  Printer,
  ShieldCheck,
  MapPin,
  CreditCard,
  XCircle,
  HelpCircle,
  Sparkles,
  AlertCircle,
} from "../../components/icons/LucideIcons.jsx";
import OrderProgressTimeline from "../../components/OrderProgressTimeline.jsx";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to load order:", err);
      const statusCode = err.response?.status;
      if (statusCode === 403) {
        setError("You do not have authorization to view this private order.");
      } else if (statusCode === 404) {
        setError(`Order #${id?.slice(-8)?.toUpperCase() || id} was not found in the boutique archive.`);
      } else {
        setError(err.response?.data?.message || "Could not retrieve order details.");
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      setOrder(res.data);
      setShowCancelModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };


  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-soft animate-pulse space-y-6">
        <div className="w-48 h-6 bg-stone-200 rounded-full" />
        <div className="w-full h-24 bg-stone-100 rounded-2xl" />
        <div className="w-full h-48 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-stone-200/80 shadow-soft text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-lg text-stone-900">{error || "Order not found"}</h2>
        <Link
          to="/user/dashboard/orders"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-900 text-amber-100 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Orders List</span>
        </Link>
      </div>
    );
  }

  const canCancel = order.status === "pending" || order.status === "processing";

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Navigation & Actions Bar (Hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/user/dashboard/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-emerald-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex items-center gap-3">
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
            >
              Cancel Order
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
                Acquisition Manifest
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-stone-900 font-bold mt-1">
              Order #{order?._id ? order._id.slice(-8).toUpperCase() : ""}
            </h1>
            <p className="text-xs text-stone-500 font-mono mt-0.5">Database ID: {order?._id || id}</p>

          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.status === "delivered"
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : order.status === "cancelled"
                  ? "bg-rose-100 text-rose-900 border border-rose-300"
                  : order.status === "shipped"
                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                  : "bg-blue-100 text-blue-900 border border-blue-300"
              }`}
            >
              {order.status}
            </span>
            <p className="text-xs text-stone-500 mt-1.5">
              Payment:{" "}
              <strong className={order.isPaid ? "text-emerald-800" : "text-amber-800"}>
                {order.isPaid ? "Paid & Verified" : "Cash on Delivery / Pending"}
              </strong>
            </p>
          </div>
        </div>

        {/* Synchronized Order Progress Timeline */}
        <OrderProgressTimeline order={order} />

        {/* Courier Dispatch Banner if Shipped */}
        {order.trackingNumber && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-stone-50 to-amber-50/40 border border-purple-200/80 flex flex-wrap items-center justify-between gap-3 text-xs mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-900 text-purple-100 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-purple-950">
                  Carrier: {order.carrier || "Boutique Armoured Courier"}
                </p>
                <p className="text-[11px] text-stone-600 font-mono">
                  Waybill / Tracking No: <strong>{order.trackingNumber}</strong>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-semibold text-[11px]">
              Insured Valuables Transport
            </span>
          </div>
        )}

        {/* Items Breakdown Table */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-stone-900">Acquired Jewellery Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-stone-500 font-semibold border-y border-stone-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Jewellery Item</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(Array.isArray(order?.items) ? order.items : []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item?.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80"}
                          alt={item?.name || "Jewel"}
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200/60 bg-stone-100 shrink-0"
                        />
                        <div>
                          <p className="font-display font-bold text-sm text-stone-900">{item?.name || "Bespoke Jewellery"}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Hallmarked 18K/22K Certified Jewellery
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-stone-700">
                      {item?.quantity ?? item?.qty ?? 1}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-stone-700">
                      ${Number(item?.price || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-display font-bold text-sm text-stone-900">
                      ${((Number(item?.price) || 0) * (Number(item?.quantity ?? item?.qty) || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Columns: Shipping Address & Financial Ledger */}
        <div className="grid md:grid-cols-2 gap-6 pt-6 mt-6 border-t border-stone-100">
          {/* Shipping Address */}
          <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-900" />
              <h3 className="font-display font-bold text-sm text-stone-900">Vault Delivery Address</h3>
            </div>
            <div className="text-stone-700 leading-relaxed pl-6 space-y-0.5">
              <p className="font-bold text-stone-900">{order?.shippingAddress?.fullName || "Recipient"}</p>
              <p>{order?.shippingAddress?.line1}</p>
              {order?.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order?.shippingAddress?.city}, {order?.shippingAddress?.state}{" "}
                {order?.shippingAddress?.postalCode}
              </p>
              <p>{order?.shippingAddress?.country || "India"}</p>
              {order?.shippingAddress?.phone && (
                <p className="text-stone-500 pt-1">Tel: {order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-emerald-900" />
              <h3 className="font-display font-bold text-sm text-stone-900">Payment Breakdown</h3>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Items Total:</span>
              <span className="font-medium">${Number(order?.itemsPrice || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Insured Vault Courier Shipping:</span>
              <span className="font-medium">
                {Number(order?.shippingPrice || 0) === 0 ? "Complimentary" : `$${Number(order?.shippingPrice || 0).toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Estimated Taxes & GST:</span>
              <span className="font-medium">${Number(order?.taxPrice || 0).toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
              <span>Total Acquisition Amount:</span>
              <span className="font-display text-base text-emerald-950">
                ${Number(order?.totalPrice || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>


        {/* Concierge Help Notice */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-amber-950">
              Have questions regarding sizing, valuation certification, or delivery schedule?
            </span>
          </div>
          <Link
            to="/user/dashboard/support"
            className="text-emerald-900 font-bold hover:underline whitespace-nowrap"
          >
            Contact Bespoke Concierge →
          </Link>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-stone-900">
                Cancel Order #{order._id.slice(-8).toUpperCase()}?
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                This action is final. Atelier preparations will cease and reserved creations will be released.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {cancelling ? "Processing…" : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
