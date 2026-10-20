import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  Lock,
} from "../components/icons/LucideIcons.jsx";

const emptyAddress = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: "",
};

const Checkout = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  // Load saved addresses from user profile
  useEffect(() => {
    if (user) {
      api
        .get("/auth/addresses")
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          setSavedAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          if (defaultAddr) {
            setAddress({
              fullName: defaultAddr.fullName || user.name || "",
              line1: defaultAddr.line1 || "",
              line2: defaultAddr.line2 || "",
              city: defaultAddr.city || "",
              state: defaultAddr.state || "",
              postalCode: defaultAddr.postalCode || "",
              country: defaultAddr.country || "India",
              phone: defaultAddr.phone || user.phone || "",
            });
          } else if (user.name || user.phone) {
            setAddress((prev) => ({
              ...prev,
              fullName: user.name || "",
              phone: user.phone || "",
            }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleChange = (e) =>
    setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handleSelectSaved = (addr) => {
    setAddress({
      fullName: addr.fullName || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      phone: addr.phone || "",
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        shippingAddress: address,
        paymentMethod,
      });
      await clearCart();
      navigate(`/user/dashboard/orders/${data._id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-28 text-center space-y-4">
        <h1 className="font-editorial text-3xl font-bold text-stone-900">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-stone-500">Please select fine jewellery items before proceeding to checkout.</p>
        <Link to="/shop" className="btn-primary inline-flex mt-2">
          Explore Fine Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-950/5 border border-gold-400/30 text-forest-950 text-[10px] font-semibold tracking-widest uppercase mb-2">
          <Lock className="w-3 h-3 text-gold-600" />
          <span>Vault Secured Checkout</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-stone-950">
          Complete Your Fine Acquisition
        </h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Shipping & Payment Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
          {/* Saved Addresses quick-select if available */}
          {savedAddresses.length > 0 && (
            <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-soft space-y-3">
              <p className="font-bold text-stone-900 text-xs">Saved Vault Addresses</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {savedAddresses.map((sa) => (
                  <button
                    key={sa._id}
                    type="button"
                    onClick={() => handleSelectSaved(sa)}
                    className="p-3 rounded-2xl border text-left text-xs transition-all hover:border-gold-500 hover:bg-[#FAF9F6] bg-white border-stone-200"
                  >
                    <p className="font-bold text-stone-900 truncate">{sa.fullName}</p>
                    <p className="text-[11px] text-stone-500 truncate">{sa.line1}, {sa.city}</p>
                    <span className="text-[10px] text-gold-700 font-semibold block mt-1">Use this address →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-soft space-y-4">
            <h2 className="font-editorial text-2xl font-bold text-stone-950 pb-2 border-b border-stone-100">
              Vault Delivery Address
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Recipient Full Name *</label>
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Maharani Meera Sen"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Contact Phone (for Courier OTP) *</label>
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Address Line 1 *</label>
              <input
                name="line1"
                value={address.line1}
                onChange={handleChange}
                placeholder="House, Villa or Suite Number, Street Name"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Address Line 2 (Optional)</label>
              <input
                name="line2"
                value={address.line2}
                onChange={handleChange}
                placeholder="Apartment, Landmark, Floor"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">City *</label>
                <input
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">State / Province *</label>
                <input
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Postal Code (PIN) *</label>
                <input
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 400001"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Country *</label>
                <input
                  name="country"
                  value={address.country}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-soft space-y-4">
            <h2 className="font-editorial text-2xl font-bold text-stone-950 pb-2 border-b border-stone-100">
              Payment & Settlement
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === "cod"
                    ? "border-forest-950 bg-forest-950/5 shadow-xs"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-0.5 accent-emerald-900"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                    <Banknote className="w-4 h-4 text-emerald-800" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Pay securely upon receipt at your doorstep after inspecting the seal.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === "card"
                    ? "border-forest-950 bg-forest-950/5 shadow-xs"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mt-0.5 accent-emerald-900"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                    <CreditCard className="w-4 h-4 text-emerald-800" />
                    <span>Debit / Credit Card / UPI</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Instant 256-bit encrypted online card or banking transfer.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={placing}
            className="btn-primary w-full !py-4 shadow-gold text-center justify-center text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>
              {placing ? "Securing Acquisition…" : `Authorize Order — $${total.toFixed(2)}`}
            </span>
          </button>
        </form>

        {/* Right: Order Manifest Summary */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-soft space-y-6 sticky top-28">
            <h2 className="font-editorial text-2xl font-bold text-stone-950 pb-3 border-b border-stone-100">
              Acquisition Manifest
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product._id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-950 shrink-0 font-sans">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Ledger breakdown */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Insured Courier</span>
                <span className="font-semibold text-emerald-800">
                  {shipping === 0 ? "Complimentary" : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Luxury Goods Tax (8%)</span>
                <span className="font-semibold text-stone-700">${tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between text-base font-bold text-stone-950">
                <span>Total Due</span>
                <span className="font-sans text-xl text-forest-950">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Packaging Guarantee */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 space-y-1.5 text-[11px]">
              <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Armoured Tamper-Evident Delivery</span>
              </p>
              <p className="text-stone-500 leading-relaxed">
                Handled by BlueDart Armoured Courier. Handover requires verified OTP and signature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
