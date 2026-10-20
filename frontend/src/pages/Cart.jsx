import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  Trash2,
} from "../components/icons/LucideIcons.jsx";

const Cart = () => {
  const { cart, subtotal, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const validCartItems = (Array.isArray(cart) ? cart : []).filter(
    (item) => item && item.product
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-28 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-editorial text-xl text-stone-600">Retrieving your atelier shopping bag…</p>
      </div>
    );
  }

  if (validCartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-forest-50 border border-gold-300/40 text-forest-950 flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-9 h-9 text-gold-700" />
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-950">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          You haven't selected any fine jewellery pieces yet. Explore our hallmarked solitaires,
          royal necklaces, and artisan gold bangles to begin your collection.
        </p>
        <div className="pt-2">
          <Link to="/shop" className="btn-primary !px-8 !py-3.5 shadow-gold inline-flex">
            <span>Explore Fine Collections</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-950/5 border border-gold-400/30 text-forest-950 text-[10px] font-semibold tracking-widest uppercase mb-2">
          <Sparkles className="w-3 h-3 text-gold-600" />
          <span>Curated Selection</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-stone-950">
          Your Shopping Bag ({validCartItems.length} {validCartItems.length === 1 ? "piece" : "pieces"})
        </h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft divide-y divide-stone-100 overflow-hidden">
            {validCartItems.map((item) => (
              <div
                key={item.product._id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 hover:bg-[#FAF9F6]/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#F7F4EE] border border-stone-200 shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <span className="text-[10px] font-cinzel font-semibold tracking-wider uppercase text-gold-700">
                      {item.product.category || "Fine Jewellery"}
                    </span>
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-950 leading-snug truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-stone-400 font-mono">
                      SKU: {item.product.sku || "VSH-JWL-ORIGINAL"} · Hallmarked 18K/22K
                    </p>
                    <p className="text-xs font-semibold text-stone-900">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                </div>

                {/* Stepper & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <div className="flex items-center border border-stone-200 bg-[#FAF9F6] rounded-full p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:bg-white text-xs font-bold transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-xs font-bold font-sans text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:bg-white text-xs font-bold transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-sans text-base sm:text-lg font-bold text-stone-950 min-w-[80px] text-right">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove piece"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Insured Transit Callout */}
          <div className="p-4 rounded-2xl bg-forest-950/5 border border-forest-950/10 flex items-center gap-3 text-xs text-forest-950">
            <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0" />
            <span>
              All pieces in your order will be shipped inside tamper-evident luxury presentation boxes with certified hallmark documentation and transit insurance.
            </span>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-soft space-y-6 sticky top-28">
            <h2 className="font-editorial text-2xl font-bold text-stone-950 pb-3 border-b border-stone-100">
              Acquisition Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Pieces Subtotal</span>
                <span className="font-bold text-stone-900">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Insured Doorstep Shipping</span>
                <span className="font-semibold text-emerald-800">
                  {subtotal > 100 ? "Complimentary" : "$9.99"}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Estimated Luxury Goods Tax (8%)</span>
                <span className="font-semibold text-stone-700">
                  ${(subtotal * 0.08).toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between text-sm sm:text-base font-bold text-stone-950">
                <span>Estimated Total</span>
                <span className="font-sans text-xl text-forest-950">
                  ${(subtotal + (subtotal > 100 ? 0 : 9.99) + subtotal * 0.08).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full !py-3.5 shadow-gold text-center justify-center text-xs"
            >
              <span>Proceed to Vault Checkout</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>

            <div className="pt-2 border-t border-stone-100 space-y-2 text-[11px] text-stone-500 text-center">
              <p className="flex items-center justify-center gap-1.5 font-medium text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified 256-bit Encrypted Checkout</span>
              </p>
              <p>Cash on Delivery & Secure Online Card options supported.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
