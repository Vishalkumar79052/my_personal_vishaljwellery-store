import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Package,
} from "../../components/icons/LucideIcons.jsx";

const emptyCategoryForm = {
  name: "",
  description: "",
  image: "",
  featured: false,
  sortOrder: 0,
};

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCategoryForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [deletingCat, setDeletingCat] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadCategories = () => {
    setLoading(true);
    api
      .get("/admin/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.warn("Failed to load categories:", err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setForm(emptyCategoryForm);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      featured: Boolean(cat.featured),
      sortOrder: cat.sortOrder || 0,
    });
    setEditingId(cat._id);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      if (editingId) {
        const res = await api.put(`/admin/categories/${editingId}`, form);
        setCategories((prev) => prev.map((c) => (c._id === editingId ? { ...res.data, productCount: c.productCount } : c)));
        setNotice(`Category "${form.name}" updated successfully.`);
      } else {
        const res = await api.post("/admin/categories", form);
        setCategories((prev) => [...prev, { ...res.data, productCount: 0 }]);
        setNotice(`Category "${form.name}" created successfully.`);
      }
      setShowModal(false);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  };

  const confirmDelete = async () => {
    if (!deletingCat) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/admin/categories/${deletingCat._id}`);
      setCategories((prev) => prev.filter((c) => c._id !== deletingCat._id));
      setNotice(`Category "${deletingCat.name}" deleted.`);
      setDeletingCat(null);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Jewellery Categories
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {categories.length} categories
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Organize catalog classification, boutique collections, and landing showcase imagery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCategories}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            className="btn-primary !px-4 !py-2 text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
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

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-800 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-soft hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative aspect-4/3 bg-[#FAF9F6] overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                    <Layers className="w-8 h-8" />
                  </div>
                )}
                {cat.featured && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                    Showcase
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-base text-stone-900">{cat.name}</h3>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {cat.productCount || 0} pieces
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                    {cat.description || "Fine handcrafted jewellery collection."}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-emerald-800 hover:text-emerald-950 font-semibold underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteError("");
                      setDeletingCat(cat);
                    }}
                    className="text-red-600 hover:text-red-800 font-semibold underline text-xs ml-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-display text-xl font-bold text-stone-900">
                {editingId ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solitaires, Bridal Sets"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short overview of this jewellery category..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catFeatured"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded border-stone-300 text-emerald-800"
                  />
                  <label htmlFor="catFeatured" className="font-semibold text-stone-800 cursor-pointer">
                    Showcase Category
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-stone-500">Order:</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-14 px-2 py-1 rounded-lg border border-stone-200 text-center"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary !text-xs !py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary !text-xs !py-2">
                  {editingId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">Delete Category</h3>
                <p className="text-xs text-stone-500">Remove "{deletingCat.name}"</p>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Are you sure you want to delete category <strong className="text-stone-900 font-bold">"{deletingCat.name}"</strong>?
              Categories currently assigned to active jewellery pieces cannot be deleted until those pieces are safely reassigned.
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {deleteError}
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
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
                {isDeleting ? "Deleting..." : "Yes, Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
