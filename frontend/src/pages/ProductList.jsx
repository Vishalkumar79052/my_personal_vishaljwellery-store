import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import { Sparkles, SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from "../components/icons/LucideIcons.jsx";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    api
      .get("/products/categories")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
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
        const list = Array.isArray(res.data?.products)
          ? res.data.products
          : Array.isArray(res.data)
          ? res.data
          : [];
        setProducts(list);
        setPages(Number(res.data?.pages) || 1);
        setTotalCount(Number(res.data?.total) || list.length);
      })
      .catch((err) => {
        console.warn("Could not load products:", err.message);
        setProducts([]);
        setPages(1);
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

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-950/5 border border-gold-400/30 text-forest-950 text-[10px] font-semibold tracking-widest uppercase">
          <Sparkles className="w-3 h-3 text-gold-600" />
          <span>Haute Joaillerie Catalogue</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-950 tracking-tight">
          Fine Jewellery Collections
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
          Explore our certified fine jewellery — crafted with 100% hallmarked gold,
          certified conflict-free diamonds, and authentic royal gemstones.
        </p>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        <button
          onClick={() => updateParam("category", "")}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
            !category
              ? "bg-forest-950 text-amber-200 border border-amber-300/40 shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          All Masterpieces
        </button>

        {categories.map((c) => (
          <button
            key={c}
            onClick={() => updateParam("category", c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
              category === c
                ? "bg-forest-950 text-amber-200 border border-amber-300/40 shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Controls Bar: Search summary, Filter tags & Sorting */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="font-semibold text-stone-800">
            Showing <strong className="text-forest-950 font-bold">{products.length}</strong> {totalCount ? `of ${totalCount}` : ""} pieces
          </span>

          {(keyword || category) && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline bg-rose-50 px-2.5 py-1 rounded-full"
            >
              <span>Clear filters</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-500 text-[11px] font-medium hidden sm:inline">Sort:</span>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="px-3 py-1.5 rounded-full border border-stone-200 bg-[#FAF9F6] text-xs text-stone-800 font-medium focus:outline-none focus:border-gold-500 shadow-2xs"
          >
            <option value="">Curated (Newest)</option>
            <option value="price_asc">Price: Modest to Royal</option>
            <option value="price_desc">Price: Royal to Modest</option>
            <option value="rating">Top Patron Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid Area */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="animate-pulse bg-white p-3.5 rounded-3xl border border-stone-200 space-y-3">
              <div className="aspect-[4/5] bg-stone-100 rounded-2xl" />
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-4 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-900 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6 text-gold-600" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-stone-900">No Jewels Found</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            We could not find any fine jewellery matching your selected criteria. Try exploring another category or clearing your filters.
          </p>
          <button onClick={clearAllFilters} className="btn-primary !py-2.5 !px-6">
            View All Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <button
            onClick={() => {
              if (page > 1) {
                const next = new URLSearchParams(searchParams);
                next.set("page", page - 1);
                setSearchParams(next);
              }
            }}
            disabled={page === 1}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", p);
                setSearchParams(next);
              }}
              className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                p === page
                  ? "bg-forest-950 text-amber-200 shadow-md border border-amber-300/40"
                  : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => {
              if (page < pages) {
                const next = new URLSearchParams(searchParams);
                next.set("page", page + 1);
                setSearchParams(next);
              }
            }}
            disabled={page === pages}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
