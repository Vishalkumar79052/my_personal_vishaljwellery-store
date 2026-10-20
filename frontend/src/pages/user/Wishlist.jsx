import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useCart } from "../../context/CartContext.jsx";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Package,
} from "../../components/icons/LucideIcons.jsx";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/wishlist");
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list.filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setItems([]);
      setError("Unable to load saved jewellery items.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      const res = await api.delete(`/auth/wishlist/${productId}`);
      setItems(res.data || []);
      setSuccess("Piece removed from your saved collection.");
    } catch (err) {
      setError("Could not remove piece from wishlist.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;
    try {
      setAddingId(product._id);
      await addToCart(product._id, 1);
      setSuccess(`"${product.name}" was transferred to your shopping bag.`);
    } catch (err) {
      setError("Could not add piece to cart.");
    } finally {
      setAddingId(null);
    }
  };

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  const handleMoveAllToCart = async () => {
    const inStockItems = safeItems.filter((i) => (Number(i?.stock) || 0) > 0);
    if (inStockItems.length === 0) {
      setError("No available in-stock jewels to move to your bag.");
      return;
    }

    try {
      setAddingId("all");
      for (const item of inStockItems) {
        await addToCart(item._id, 1);
      }
      setSuccess(`Added ${inStockItems.length} jewellery piece(s) to your shopping bag.`);
    } catch (err) {
      setError("Error adding some pieces to cart.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
            Private Curation
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Saved Jewels & Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Your personal treasury of admired high jewellery, solitaire rings, and bespoke creations.
          </p>
        </div>

        {safeItems.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            disabled={addingId === "all"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs shrink-0 disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{addingId === "all" ? "Transferring…" : "Move All In-Stock to Bag"}</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess("")} className="font-bold text-emerald-700">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="font-bold text-rose-700">
            ✕
          </button>
        </div>
      )}

      {/* Wishlist Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft animate-pulse space-y-4"
            >
              <div className="w-full h-52 bg-stone-200 rounded-2xl" />
              <div className="w-32 h-4 bg-stone-200 rounded-full" />
              <div className="w-20 h-4 bg-stone-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : safeItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8 stroke-1 text-amber-700" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900">
              Your jewellery wishlist is empty
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Curate your desired diamond solitaires, bridal parures, and heirloom rings for special occasions.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs"
          >
            <span>Explore High Jewellery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeItems.map((product) => {

            const isOutOfStock = product.stock <= 0;
            const originalPrice = product.price;
            const hasDiscount = product.discount > 0;
            const finalPrice = hasDiscount
              ? originalPrice * (1 - product.discount / 100)
              : originalPrice;

            return (
              <div
                key={product._id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden flex flex-col justify-between group hover:border-amber-300 transition-all"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img
                      src={
                        product.images?.[0] ||
                        product.image ||
                        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={removingId === product._id}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-stone-500 hover:text-rose-600 shadow-sm transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {hasDiscount && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-emerald-950 uppercase tracking-wider">
                          {product.discount}% Off
                        </span>
                      )}
                      {isOutOfStock ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/90 text-amber-200 backdrop-blur-xs uppercase tracking-wider">
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase block">
                      {product.category || "Fine Jewellery"}
                    </span>
                    <Link
                      to={`/product/${product._id}`}
                      className="font-display font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {product.description || "Handcrafted with ethical stones and precious metals."}
                    </p>

                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="font-display font-bold text-lg text-stone-900">
                        ${finalPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-stone-400 line-through">
                          ${originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock || addingId === product._id}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                      isOutOfStock
                        ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                        : "bg-emerald-900 hover:bg-emerald-800 text-amber-100 shadow-xs"
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>
                      {addingId === product._id
                        ? "Adding to Bag…"
                        : isOutOfStock
                        ? "Currently Unavailable"
                        : "Transfer to Shopping Bag"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
