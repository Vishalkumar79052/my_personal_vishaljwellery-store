import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (sort) params.sort = sort;

    api
      .get("/products", { params })
      .then((res) => {
        setProducts(res.data.products);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [keyword, category, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl text-ink mb-2">Shop the collection</h1>
      <p className="text-forest-800/60 mb-8">{keyword ? `Results for "${keyword}"` : "All products"}</p>

      <div className="flex flex-wrap gap-3 mb-10">
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="input-field !w-auto rounded-full text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="input-field !w-auto rounded-full text-sm"
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <p className="text-forest-700/60">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-forest-700/60">No products found. Try a different search.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", p);
                setSearchParams(next);
              }}
              className={`w-9 h-9 rounded-full text-sm font-medium ${
                p === page ? "bg-forest-700 text-cream" : "hover:bg-forest-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
