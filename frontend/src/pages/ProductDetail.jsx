import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  Heart,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  Star,
} from "../components/icons/LucideIcons.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const loadProduct = () => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        if (res.data) {
          const mainImg = res.data.image || (res.data.images && res.data.images[0]) || "";
          setSelectedImage(mainImg);
        }
      })
      .catch((err) => {
        console.warn("Could not load product:", err.message);
      });
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Check if piece is in user's wishlist
  useEffect(() => {
    if (user && product) {
      api
        .get("/auth/wishlist")
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          setWishlistSaved(list.some((item) => (item._id || item) === product._id));
        })
        .catch(() => {});
    }
  }, [user, product]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    setAdding(true);
    setMessage("");
    try {
      await addToCart(id, quantity);
      setMessage("Masterpiece successfully added to your shopping bag.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add item to bag");
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) return navigate("/login");
    try {
      if (wishlistSaved) {
        await api.delete(`/auth/wishlist/${product._id}`);
        setWishlistSaved(false);
      } else {
        await api.post(`/auth/wishlist/${product._id}`);
        setWishlistSaved(true);
      }
    } catch (err) {
      console.warn("Wishlist toggle error:", err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      loadProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-28 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-editorial text-xl text-stone-600">Retrieving atelier masterpiece details…</p>
      </div>
    );
  }

  const allImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  // Deduplicate images
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-forest-950 transition-colors">
          Storefront
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link to="/shop" className="hover:text-forest-950 transition-colors">
          Collections
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        {product.category && (
          <>
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-forest-950 transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </>
        )}
        <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Stage */}
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Image Gallery Stage */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual */}
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-[#F7F4EE] border border-gold-300/30 relative shadow-soft group">
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />

            {/* Hallmark Pill */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-950/85 backdrop-blur-md text-amber-200 text-xs font-semibold tracking-wider uppercase border border-amber-300/40 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>BIS 916 Sovereign Hallmark</span>
              </span>
            </div>

            {/* Wishlist Floating Button */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border transition-all shadow-md ${
                wishlistSaved
                  ? "bg-rose-50 border-rose-300 text-rose-600 scale-105"
                  : "bg-white/85 border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-white"
              }`}
              title={wishlistSaved ? "Saved to Wishlist" : "Save to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${wishlistSaved ? "fill-rose-600" : ""}`} />
            </button>
          </div>

          {/* Thumbnails row if multiple images exist */}
          {uniqueImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {uniqueImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? "border-gold-500 ring-2 ring-gold-400/30 scale-105"
                      : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications, Pricing & Purchasing */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-stone-200/80 pb-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-cinzel tracking-widest uppercase font-semibold text-gold-700">
                {product.category || "Atelier Solitaire Suite"}
              </p>
              <div className="flex items-center text-amber-500 text-xs font-semibold">
                <span>★</span>
                <span className="text-stone-700 text-xs ml-1">
                  {product.rating > 0 ? product.rating.toFixed(1) : "5.0"}
                </span>
                <span className="text-stone-400 text-[11px] ml-1">
                  ({product.numReviews || 12} reviews)
                </span>
              </div>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 leading-tight">
              {product.name}
            </h1>

            <p className="text-xs font-mono text-stone-400 tracking-wider">
              SKU: {product.sku || "VSH-JWL-EXCLUSIVE"} · 18K Yellow Gold Certified
            </p>
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 flex items-baseline justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-0.5">
                Atelier Price (Incl. Taxes & Insured Shipping)
              </p>
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-3xl font-bold text-stone-950">
                  ${Number(product.price || 0).toFixed(2)}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="text-sm text-stone-400 line-through">
                    ${Number(product.compareAtPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {product.stock > 0 ? "In Stock & Ready" : "Made to Order"}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            {product.description ||
              "An exquisite heirloom piece handcrafted in solid gold and certified natural gemstones, hallmarked for purity and lifetime radiance."}
          </p>

          {/* Quantity Selector & Add to Bag */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-stone-200 bg-white rounded-full p-1 shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 text-sm font-bold"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-xs font-bold font-sans text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 text-sm font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="btn-primary flex-1 !py-3.5 shadow-gold text-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 text-amber-300" />
                <span>
                  {product.stock === 0
                    ? "Currently Reserved"
                    : adding
                    ? "Adding to Bag…"
                    : "Add to Shopping Bag"}
                </span>
              </button>
            </div>

            {message && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{message}</span>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
              <div>
                <p className="font-bold text-stone-900 text-[11px]">BIS Hallmarked</p>
                <p className="text-[10px] text-stone-500">Government Certified Purity</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200/80">
              <Truck className="w-4 h-4 text-emerald-800 shrink-0" />
              <div>
                <p className="font-bold text-stone-900 text-[11px]">Armoured Delivery</p>
                <p className="text-[10px] text-stone-500">100% Insured Transit</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200/80">
              <RotateCcw className="w-4 h-4 text-emerald-800 shrink-0" />
              <div>
                <p className="font-bold text-stone-900 text-[11px]">30-Day Return</p>
                <p className="text-[10px] text-stone-500">Full Exchange Guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200/80">
              <Award className="w-4 h-4 text-emerald-800 shrink-0" />
              <div>
                <p className="font-bold text-stone-900 text-[11px]">Lifetime Polish</p>
                <p className="text-[10px] text-stone-500">Free Atelier Maintenance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patron Reviews Section */}
      <section className="pt-12 border-t border-stone-200 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-950">
              Patron Reviews & Reflections
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Verified appraisals from owners of this fine creation.
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {(!Array.isArray(product.reviews) || product.reviews.length === 0) ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-stone-200 text-stone-500 text-xs">
              No reviews yet. Be the first patron to appraise this certified piece.
            </div>
          ) : (
            product.reviews.map((r, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">{r.name}</span>
                  <div className="text-amber-400 text-xs">
                    {"★".repeat(r.rating || 5)}
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{r.comment}</p>
                <p className="text-[10px] text-stone-400">
                  Verified Maison Acquisition
                </p>
              </div>
            ))
          )}
        </div>

        {/* Leave Review Form */}
        {user ? (
          <form onSubmit={handleReviewSubmit} className="p-6 rounded-3xl bg-white border border-stone-200 shadow-soft space-y-4 text-xs">
            <h3 className="font-editorial text-xl font-bold text-stone-950">Appraise This Piece</h3>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Your Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                className="input-field !w-auto"
              >
                <option value="5">★★★★★ — Exceptional Quality (5 Stars)</option>
                <option value="4">★★★★☆ — Splendid Craftsmanship (4 Stars)</option>
                <option value="3">★★★☆☆ — Acceptable Quality (3 Stars)</option>
                <option value="2">★★☆☆☆ — Below Expectations (2 Stars)</option>
                <option value="1">★☆☆☆☆ — Unsatisfactory (1 Star)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Your Appraisal / Notes</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                rows={3}
                placeholder="Share your thoughts on the gemstone lustre, hallmarking, and presentation..."
                required
                className="input-field resize-none"
              />
            </div>

            {reviewError && (
              <p className="text-xs text-rose-700 font-semibold">{reviewError}</p>
            )}

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="btn-primary !py-2.5 !px-6"
            >
              {reviewSubmitting ? "Submitting…" : "Publish Appraisal"}
            </button>
          </form>
        ) : (
          <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-center text-xs text-stone-700 space-y-2">
            <p>Please sign in to your patron account to appraise this piece.</p>
            <Link to="/login" className="btn-primary !py-2 !px-5 inline-block">
              Sign In to Review
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
