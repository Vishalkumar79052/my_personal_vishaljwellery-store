import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";

const emptyAddress = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
};

const Checkout = () => {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const { data } = await api.post("/orders", { shippingAddress: address, paymentMethod });
      await clearCart();
      navigate(`/dashboard/orders/${data._id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-forest-700/60">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-10">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-12">
        <form onSubmit={handlePlaceOrder} className="md:col-span-2 space-y-4">
          <h2 className="font-display text-xl mb-2">Shipping address</h2>
          <input
            name="fullName"
            value={address.fullName}
            onChange={handleChange}
            placeholder="Full name"
            className="input-field"
            required
          />
          <input
            name="line1"
            value={address.line1}
            onChange={handleChange}
            placeholder="Address line 1"
            className="input-field"
            required
          />
          <input
            name="line2"
            value={address.line2}
            onChange={handleChange}
            placeholder="Address line 2 (optional)"
            className="input-field"
          />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" value={address.city} onChange={handleChange} placeholder="City" className="input-field" required />
            <input name="state" value={address.state} onChange={handleChange} placeholder="State / Province" className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              placeholder="Postal code"
              className="input-field"
              required
            />
            <input name="country" value={address.country} onChange={handleChange} placeholder="Country" className="input-field" required />
          </div>
          <input name="phone" value={address.phone} onChange={handleChange} placeholder="Phone number" className="input-field" required />

          <h2 className="font-display text-xl mb-2 pt-4">Payment method</h2>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
            <option value="cod">Cash on delivery</option>
            <option value="card">Credit / debit card</option>
          </select>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={placing} className="btn-primary w-full mt-4">
            {placing ? "Placing order…" : `Place order — $${total.toFixed(2)}`}
          </button>
        </form>

        <div className="card p-6 h-fit">
          <h2 className="font-display text-xl mb-4">Order summary</h2>
          {cart.map((item) => (
            <div key={item.product._id} className="flex justify-between text-sm mb-2">
              <span className="text-forest-700/70">
                {item.product.name} × {item.quantity}
              </span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-forest-100 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-forest-700/70">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-700/70">Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest-700/70">Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
