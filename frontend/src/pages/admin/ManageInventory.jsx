import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios.js";
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Plus,
  DollarSign,
  Package,
} from "../../components/icons/LucideIcons.jsx";

const ManageInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // 'all' | 'low' | 'out' | 'in'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("stock_asc");
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [editingStockValues, setEditingStockValues] = useState({});

  const loadInventory = () => {
    setLoading(true);
    api
      .get("/products", { params: { limit: 250 } })
      .then((res) => {
        const list = Array.isArray(res.data?.products) ? res.data.products : Array.isArray(res.data) ? res.data : [];
        setProducts(list);
        // Initialize stock edit inputs
        const initialMap = {};
        list.forEach((p) => {
          initialMap[p._id] = p.stock ?? 0;
        });
        setEditingStockValues(initialMap);
      })
      .catch((err) => {
        console.warn("Failed to load inventory:", err.message);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockAction = async (id, action, amount) => {
    setUpdatingId(id);
    try {
      const payload = { action, amount };
      const res = await api.put(`/admin/products/${id}/stock`, payload);
      setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
      setEditingStockValues((prev) => ({ ...prev, [id]: res.data.stock }));
      setNotice(`Updated stock for "${res.data.name}" to ${res.data.stock} units.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setNotice(err.response?.data?.message || "Failed to adjust stock quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExactStockSave = async (id) => {
    const desiredStock = Number(editingStockValues[id]);
    if (isNaN(desiredStock) || desiredStock < 0) {
      setNotice("Stock must be a non-negative number.");
      return;
    }
    setUpdatingId(id);
    try {
      const res = await api.put(`/admin/products/${id}/stock`, { stock: desiredStock });
      setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
      setNotice(`Saved stock for "${res.data.name}" to ${res.data.stock} units.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setNotice(err.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdatingId(null);
    }
  };

  // Distinct Categories
  const categories = useMemo(() => {
    const set = new Set();
    (Array.isArray(products) ? products : []).forEach((p) => {
      if (p?.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Overall Inventory Analytics
  const analytics = useMemo(() => {
    let totalUnits = 0;
    let totalAssetValuation = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;

    (Array.isArray(products) ? products : []).forEach((p) => {
      const stock = Number(p?.stock) || 0;
      totalUnits += stock;
      totalAssetValuation += (Number(p?.price) || 0) * stock;
      if (stock <= 0) outOfStockCount++;
      else if (stock <= 5) lowStockCount++;
    });


    return { totalUnits, totalAssetValuation, outOfStockCount, lowStockCount };
  }, [products]);

  // Filtered & Sorted inventory
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
        const matchesStock =
          stockFilter === "all"
            ? true
            : stockFilter === "in"
            ? p.stock > 5
            : stockFilter === "low"
            ? p.stock > 0 && p.stock <= 5
            : p.stock <= 0;

        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q);

        return matchesCategory && matchesStock && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "stock_asc") return a.stock - b.stock;
        if (sortBy === "stock_desc") return b.stock - a.stock;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "price_asc") return a.price - b.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, categoryFilter, stockFilter, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Inventory & Stock Control
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Synced
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Audit high-value jewellery stock levels, replenish units, and monitor catalog valuation.
          </p>
        </div>

        <button
          onClick={loadInventory}
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs self-start sm:self-auto"
          title="Refresh Stock Counts"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="text-emerald-700 font-semibold hover:text-emerald-950">
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total Units in Stock</span>
          <p className="font-display text-3xl font-bold text-stone-900 mt-1">{analytics.totalUnits}</p>
          <p className="text-xs text-stone-500 mt-1">Across {Array.isArray(products) ? products.length : 0} jewellery items</p>

        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Inventory Valuation</span>
          <p className="font-display text-3xl font-bold text-emerald-950 mt-1">
            ${analytics.totalAssetValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-stone-500 mt-1">Retail asset value</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Low Stock Warnings</span>
          <p className="font-display text-3xl font-bold text-amber-700 mt-1">{analytics.lowStockCount}</p>
          <p className="text-xs text-stone-500 mt-1">Pieces with 1 - 5 units left</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Out of Stock</span>
          <p className="font-display text-3xl font-bold text-red-600 mt-1">{analytics.outOfStockCount}</p>
          <p className="text-xs text-stone-500 mt-1">Unavailable on storefront</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search inventory by title, category, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-xs text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock Only (1 - 5)</option>
            <option value="out">Out of Stock (0)</option>
            <option value="in">Healthy Stock (&gt; 5)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
          >
            <option value="stock_asc">Sort: Stock (Lowest First)</option>
            <option value="stock_desc">Sort: Stock (Highest First)</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Stock Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-800 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Checking inventory records...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900">No Inventory Items Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchTerm
                ? `No inventory items match "${searchTerm}".`
                : "No items match the selected stock criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-stone-200/80 text-stone-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Piece</th>
                  <th className="py-3 px-5">Category & SKU</th>
                  <th className="py-3 px-5">Unit Price</th>
                  <th className="py-3 px-5">Asset Value</th>
                  <th className="py-3 px-5">Stock Status</th>
                  <th className="py-3 px-5">Quick Adjust</th>
                  <th className="py-3 px-5 text-right">Exact Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => {
                  const isUpdating = updatingId === p._id;
                  const currentStock = p.stock ?? 0;
                  const assetValue = (p.price || 0) * currentStock;

                  return (
                    <tr key={p._id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 truncate max-w-[180px]">{p.name}</p>
                            <p className="text-[10px] text-stone-400">{p.brand || "Vishal Haute Joaillerie"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="font-medium text-stone-800">{p.category}</p>
                        <p className="text-[10px] font-mono text-stone-400">SKU: {p.sku || "—"}</p>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-stone-900">
                        ${p.price?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 font-display font-bold text-emerald-950">
                        ${assetValue.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            currentStock <= 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : currentStock <= 5
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {currentStock <= 0
                            ? "Out of stock"
                            : currentStock <= 5
                            ? `${currentStock} low stock`
                            : `${currentStock} in stock`}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {/* Quick increment/decrement buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            disabled={isUpdating || currentStock <= 0}
                            onClick={() => handleStockAction(p._id, "decrement", 1)}
                            className="w-7 h-7 rounded-lg border border-stone-200 hover:bg-stone-100 flex items-center justify-center font-bold text-stone-700 disabled:opacity-40"
                            title="Decrease by 1"
                          >
                            -1
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStockAction(p._id, "increment", 1)}
                            className="w-7 h-7 rounded-lg border border-stone-200 hover:bg-stone-100 flex items-center justify-center font-bold text-stone-700 disabled:opacity-40"
                            title="Increase by 1"
                          >
                            +1
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStockAction(p._id, "increment", 5)}
                            className="px-2 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-[10px] font-bold text-emerald-900 disabled:opacity-40"
                            title="Restock +5"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {/* Direct input and save */}
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <input
                            type="number"
                            min="0"
                            value={editingStockValues[p._id] ?? currentStock}
                            onChange={(e) =>
                              setEditingStockValues({
                                ...editingStockValues,
                                [p._id]: e.target.value,
                              })
                            }
                            className="w-16 px-2 py-1 text-center font-bold border border-stone-200 rounded-lg text-xs"
                          />
                          <button
                            disabled={isUpdating}
                            onClick={() => handleExactStockSave(p._id)}
                            className="px-2.5 py-1 bg-emerald-900 hover:bg-emerald-800 text-amber-100 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? "..." : "Set"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInventory;
