import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios.js";
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  AlertTriangle,
  UploadCloud,
  CheckCircle,
  X,
  Sparkles,
  RefreshCw,
  ImagePlus,
} from "../../components/icons/LucideIcons.jsx";

const JEWELLERY_CATEGORIES = [
  "Rings",
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Bangles",
  "Pendants",
  "Bridal Sets",
  "Solitaires",
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "Rings",
  brand: "Vishal Haute Joaillerie",
  image: "",
  images: [],
  stock: 10,
  sku: "",
  isFeatured: false,
};

const ManageProducts = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Image Upload States
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  // Deletion Modal
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    api
      .get("/products", { params: { limit: 200 } })
      .then((res) => {
        const list = Array.isArray(res.data?.products) ? res.data.products : Array.isArray(res.data) ? res.data : [];
        setProducts(list);
      })
      .catch((err) => {
        console.warn("Failed to load products:", err.message);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    loadProducts();
  }, []);

  // Sync search from URL param if present
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) setSearchTerm(urlSearch);
  }, [searchParams]);

  const openCreateModal = () => {
    setForm({
      ...emptyForm,
      sku: `VJ-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setEditingId(null);
    setError("");
    setUploadError("");
    setPreviewImages([]);
    setShowUrlFallback(false);
    setShowForm(true);
  };

  const openEditModal = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice || "",
      category: p.category || "Rings",
      brand: p.brand || "Vishal Haute Joaillerie",
      image: p.image || "",
      images: p.images || [],
      stock: p.stock ?? 0,
      sku: p.sku || "",
      isFeatured: Boolean(p.isFeatured),
    });
    setPreviewImages(p.images?.length ? p.images : p.image ? [p.image] : []);
    setEditingId(p._id);
    setError("");
    setUploadError("");
    setShowUrlFallback(false);
    setShowForm(true);
  };

  // Handle Multi-Image Upload with Cloudinary Validation
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadError("");

    const validFiles = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Invalid file type: Please upload image files (JPG, PNG, WEBP, GIF, SVG)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 10MB limit`);
        return;
      }
      validFiles.push(file);
    }

    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await api.post("/admin/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }

      setForm((prev) => {
        const allImages = [...(prev.images || []), ...uploadedUrls];
        return {
          ...prev,
          image: prev.image || uploadedUrls[0] || "",
          images: allImages,
        };
      });

      setPreviewImages((prev) => [...prev, ...uploadedUrls]);
      setNotice(`Uploaded ${uploadedUrls.length} image(s) to Cloudinary CDN.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || "Failed to upload image(s)");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setForm((prev) => {
      const updatedImages = (prev.images || []).filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        image: updatedImages[0] || "",
        images: updatedImages,
      };
    });
    setPreviewImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please provide a product title.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError("Please provide a valid price greater than $0.");
      return;
    }
    if (!form.image && (!form.images || form.images.length === 0)) {
      setError("Please upload at least one product image.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      category: form.category,
      brand: form.brand.trim() || "Vishal Haute Joaillerie",
      image: form.image || form.images[0],
      images: form.images?.length ? form.images : [form.image],
      stock: Math.max(0, parseInt(form.stock, 10) || 0),
      sku: form.sku.trim(),
      isFeatured: Boolean(form.isFeatured),
    };

    try {
      if (editingId) {
        const res = await api.put(`/admin/products/${editingId}`, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
        setNotice(`Product "${payload.name}" updated successfully.`);
      } else {
        const res = await api.post("/admin/products", payload);
        setProducts((prev) => [res.data, ...prev]);
        setNotice(`Product "${payload.name}" added to catalog.`);
      }
      setShowForm(false);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product in database");
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/products/${deletingProduct._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      setNotice(`Product "${deletingProduct.name}" removed from catalog.`);
      setDeletingProduct(null);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & Sorted Products
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
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q);

        return matchesCategory && matchesStock && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "stock_asc") return a.stock - b.stock;
        if (sortBy === "stock_desc") return b.stock - a.stock;
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [products, categoryFilter, stockFilter, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Jewellery Catalog
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredProducts.length} items
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage high-jewelry creations, inventory counts, pricing, and Cloudinary media assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-xs"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="btn-primary !px-4 !py-2 text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Jewellery</span>
          </button>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-soft space-y-4">
        {/* Categories Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === "all"
                ? "bg-emerald-900 text-amber-100 font-semibold shadow-xs"
                : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            All Categories
          </button>
          {JEWELLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-emerald-900 text-amber-100 font-semibold shadow-xs"
                  : "bg-stone-50 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search, Stock Filter, Sort, View Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, category, SKU..."
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
              <option value="all">All Stock Statuses</option>
              <option value="in">In Stock (&gt; 5)</option>
              <option value="low">Low Stock (1 - 5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-700"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Lowest First</option>
              <option value="stock_desc">Stock: Highest First</option>
              <option value="name_asc">Name: A to Z</option>
            </select>

            {/* View Mode Toggle */}
            <div className="bg-stone-100 p-0.5 rounded-xl flex items-center">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  viewMode === "grid" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-500"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  viewMode === "table" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-500"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Render */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-800 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Loading jewellery pieces...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-stone-900">No Jewellery Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchTerm
              ? `No creations match your search for "${searchTerm}".`
              : "No jewellery creations match the selected filter criteria."}
          </p>
          <button onClick={openCreateModal} className="btn-primary !text-xs !py-2 inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add First Creation</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Luxury Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-soft hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative aspect-square bg-[#FAF9F6] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Stock Warning Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {p.stock <= 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                      Out of stock
                    </span>
                  ) : p.stock <= 5 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                      Only {p.stock} left
                    </span>
                  ) : null}

                  {p.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                      Featured
                    </span>
                  )}
                </div>

                {/* Action Shortcuts */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-xl bg-white/95 text-stone-700 hover:text-emerald-900 shadow-sm"
                    title="Edit Piece"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingProduct(p)}
                    className="p-1.5 rounded-xl bg-white/95 text-stone-700 hover:text-red-700 shadow-sm"
                    title="Delete Piece"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                      {p.category}
                    </span>
                    {p.sku && <span className="text-[10px] font-mono text-stone-400">SKU: {p.sku}</span>}
                  </div>
                  <h3 className="font-display font-bold text-sm text-stone-900 line-clamp-1 mt-0.5">{p.name}</h3>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">{p.description}</p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-base font-bold text-emerald-950">${p.price.toFixed(2)}</span>
                      {p.compareAtPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          ${p.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 block">Stock: {p.stock} units</span>
                  </div>

                  <button
                    onClick={() => openEditModal(p)}
                    className="btn-secondary !text-xs !py-1 !px-2.5"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Luxury Table View */
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-stone-200/80 text-stone-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Piece</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">SKU</th>
                  <th className="py-3 px-5">Price</th>
                  <th className="py-3 px-5">Stock</th>
                  <th className="py-3 px-5">Featured</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[10px] text-stone-400 truncate max-w-[200px]">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 font-medium text-stone-700">{p.category}</td>
                    <td className="py-3 px-5 font-mono text-stone-500">{p.sku || "—"}</td>
                    <td className="py-3 px-5 font-semibold text-emerald-950">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.stock <= 0
                            ? "bg-red-50 text-red-700 border-red-200"
                            : p.stock <= 5
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      {p.isFeatured ? (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-emerald-800 hover:text-emerald-950 font-semibold underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        className="text-red-600 hover:text-red-800 font-semibold underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Slide-over Modal Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-stone-200 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-display text-xl font-bold text-stone-900">
                  {editingId ? "Edit Jewellery Piece" : "Add New Jewellery Piece"}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Save jewellery specifications, pricing, and Cloudinary media assets.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Title */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Creation Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Solitaire Diamond Ring"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                />
              </div>

              {/* Category, Brand & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:border-emerald-600"
                  >
                    {JEWELLERY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. VJ-7840"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Brand / Maison</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              {/* Price, Compare Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Compare-at Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Original price before discount"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description & Craftsmanship</label>
                <textarea
                  rows={3}
                  placeholder="Detail diamond clarity, carat, metal purity (18K/22K Gold), and bespoke setting details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                />
              </div>

              {/* Cloudinary Multi-Image Upload Area */}
              <div className="space-y-2">
                <label className="block font-semibold text-stone-700">Product Photography (Cloudinary CDN)</label>
                
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-stone-200 bg-[#FAF9F6] hover:bg-stone-50 hover:border-emerald-400"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-stone-800">
                    {uploadingImage ? "Uploading to Cloudinary CDN..." : "Click or drag images to upload"}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Supports multiple files (PNG, JPG, WEBP, GIF, SVG) up to 10MB each
                  </p>
                </div>

                {uploadError && <p className="text-red-600 text-[11px] font-medium">{uploadError}</p>}

                {/* Uploaded Previews Gallery */}
                {previewImages.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-stone-600 mb-2">
                      Gallery Images ({previewImages.length}) — First image is primary:
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {previewImages.map((url, idx) => (
                        <div key={idx} className="relative group w-18 h-18 rounded-xl overflow-hidden border border-stone-200">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-stone-900/70 text-amber-200 text-[8px] text-center font-bold py-0.5">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional manual URL toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] text-emerald-800 hover:underline font-medium"
                  >
                    {showUrlFallback ? "Hide URL input" : "+ Enter direct image URL instead"}
                  </button>
                  {showUrlFallback && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={form.image}
                        onChange={(e) => {
                          setForm({ ...form, image: e.target.value });
                          if (e.target.value) setPreviewImages([e.target.value]);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-stone-300 text-emerald-800 focus:ring-emerald-600"
                />
                <label htmlFor="isFeatured" className="font-semibold text-stone-800 cursor-pointer">
                  Feature this piece on homepage curation & showcase
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary !text-xs !py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="btn-primary !text-xs !py-2.5 disabled:opacity-50"
                >
                  {editingId ? "Save Changes" : "Publish to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">Delete Jewellery Piece</h3>
                <p className="text-xs text-stone-500">This action will remove the item from the catalog.</p>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-stone-900 font-bold">"{deletingProduct.name}"</strong>?
              Associated orders will preserve their historical item manifest records.
            </p>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="btn-secondary !text-xs !py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Piece"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
