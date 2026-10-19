import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const Cart = () => {
  const { cart, subtotal, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-24 text-center text-forest-700/60">Loading cart…</div>;

  if (cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
        <Link to="/shop" className="btn-primary inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-10">Your cart</h1>
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.product._id} className="flex gap-4 pb-6 border-b border-forest-100">
              <img src={item.product.image} alt={item.product.name} className="w-24 h-24 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="font-display text-lg">{item.product.name}</h3>
                <p className="text-sm text-forest-700/60 mb-3">${item.product.price.toFixed(2)} each</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-forest-200 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="text-xs text-forest-700/50 hover:text-clay-600 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-display text-xl mb-4">Order summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-forest-700/70">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-forest-700/50 mb-6">Shipping and tax calculated at checkout.</p>
          <button onClick={() => navigate("/checkout")} className="btn-primary w-full">
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
