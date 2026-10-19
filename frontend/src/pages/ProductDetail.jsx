import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");

  const loadProduct = () => api.get(`/products/${id}`).then((res) => setProduct(res.data));

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    setAdding(true);
    setMessage("");
    try {
      await addToCart(id, quantity);
      setMessage("Added to cart");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      loadProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not submit review");
    }
  };

  if (!product) return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-forest-700/60">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-sand">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div>
          <p className="uppercase tracking-wide text-xs text-forest-500 mb-2">{product.category}</p>
          <h1 className="font-display text-4xl text-ink mb-4">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-medium">${product.price.toFixed(2)}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-forest-700/40 line-through">${product.compareAtPrice.toFixed(2)}</span>
            )}
          </div>
          <p className="text-forest-800/70 leading-relaxed mb-8">{product.description}</p>

          <p className="text-sm mb-4 text-forest-800/60">
            {product.stock > 0 ? `${product.stock} in stock` : "Currently sold out"}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-forest-200 rounded-full">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-lg"
              >
                −
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-10 h-10 flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="btn-primary flex-1"
            >
              {product.stock === 0 ? "Sold out" : adding ? "Adding…" : "Add to cart"}
            </button>
          </div>
          {message && <p className="text-sm text-forest-600">{message}</p>}
        </div>
      </div>

      <section className="mt-20 max-w-2xl">
        <h2 className="font-display text-2xl text-ink mb-6">
          Reviews {product.numReviews > 0 && `(${product.numReviews} · ★${product.rating.toFixed(1)})`}
        </h2>

        <div className="space-y-4 mb-10">
          {product.reviews.length === 0 && <p className="text-forest-700/60 text-sm">No reviews yet.</p>}
          {product.reviews.map((r, idx) => (
            <div key={idx} className="card p-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{r.name}</span>
                <span className="text-clay-600">{"★".repeat(r.rating)}</span>
              </div>
              <p className="text-sm text-forest-800/70">{r.comment}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleReviewSubmit} className="card p-5 space-y-3">
            <h3 className="font-medium">Leave a review</h3>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              className="input-field !w-auto"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} star{r > 1 && "s"}
                </option>
              ))}
            </select>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your thoughts…"
              className="input-field"
              rows={3}
              required
            />
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            <button type="submit" className="btn-secondary">
              Submit review
            </button>
          </form>
        ) : (
          <p className="text-sm text-forest-700/60">
            <span className="underline cursor-pointer" onClick={() => navigate("/login")}>
              Sign in
            </span>{" "}
            to leave a review.
          </p>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
