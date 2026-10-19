import { useEffect, useState, useRef } from "react";
import api from "../../api/axios.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "",
  brand: "",
  image: "",
  stock: "",
  sku: "",
  isFeatured: false,
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProducts = () =>
    api
      .get("/products", { params: { limit: 100 } })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setUploadError("");
    setUploadNotice("");
    setShowUrlInput(false);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice || "",
      category: p.category,
      brand: p.brand || "",
      image: p.image,
      stock: p.stock,
      sku: p.sku || "",
      isFeatured: p.isFeatured,
    });
    setEditingId(p._id);
    setError("");
    setUploadError("");
    setUploadNotice("");
    setShowUrlInput(false);
    setShowForm(true);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (PNG, JPG, WEBP, GIF, SVG)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit");
      return;
    }

    setUploadError("");
    setUploadNotice("");
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        setForm((f) => ({ ...f, image: res.data.url }));
        setUploadNotice(
          res.data.isCloudinary
            ? "Uploaded to Cloudinary CDN successfully"
            : "Uploaded to media storage successfully"
        );
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload file. You can enter an image URL directly.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock),
    };
    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    }
  };

  const openDeleteModal = (p) => {
    setDeleteError("");
    setDeletingProduct(p);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/admin/products/${deletingProduct._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      setNotice(`"${deletingProduct.name}" has been deleted.`);
      setDeletingProduct(null);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Products</h1>
        <button id="add-product-btn" onClick={openCreate} className="btn-primary">
          + Add product
        </button>
      </div>

      {notice && (
        <div id="product-action-notice" className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs ml-4">Dismiss</button>
        </div>
      )}

      {loading ? (
        <p className="text-forest-700/60 text-sm">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-forest-700/60 border-b border-forest-100">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Stock</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-forest-50 hover:bg-forest-50/30 transition-colors">
                  <td className="py-3 pr-4 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="py-3 pr-4 text-forest-700/70">{p.category}</td>
                  <td className="py-3 pr-4">${p.price.toFixed(2)}</td>
                  <td className="py-3 pr-4">{p.stock}</td>
                  <td className="py-3 pr-4 text-right space-x-3 whitespace-nowrap">
                    <button
                      id={`edit-product-${p._id}`}
                      onClick={() => openEdit(p)}
                      className="text-forest-700 hover:text-forest-950 font-medium underline transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      id={`delete-product-${p._id}`}
                      onClick={() => openDeleteModal(p)}
                      className="text-clay-600 hover:text-red-700 font-medium underline transition-colors cursor-pointer"
                      title={`Delete ${p.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* In-app Deletion Modal that works safely inside iframe */}
      {deletingProduct && (
        <div id="delete-confirmation-modal" className="fixed inset-0 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-2xl p-6 w-full max-w-md border border-forest-100 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-ink">Delete Product</h2>
            </div>

            <p className="text-forest-700/80 text-sm mb-4 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-ink font-semibold">"{deletingProduct.name}"</strong> from your store? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                id="confirm-delete-button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                type="button"
                id="cancel-delete-button"
                onClick={() => {
                  setDeletingProduct(null);
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="btn-secondary flex-1 py-2.5 px-4 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-6 z-50">
          <div className="bg-cream rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <h2 className="font-display text-2xl mb-4">{editingId ? "Edit product" : "New product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field"
                rows={3}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Compare-at price"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="input-field"
                  required
                />
                <input
                  placeholder="Brand"
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  className="input-field"
                />
              </div>
              {/* Cloudinary Media Upload & Image Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-forest-800">
                  <span>Product Image</span>
                  {form.image?.includes("cloudinary.com") ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Cloudinary CDN
                    </span>
                  ) : form.image ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
                      Media Attached
                    </span>
                  ) : null}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                />

                {/* Image Preview Box when image exists */}
                {form.image ? (
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-forest-100 shadow-xs">
                    <img
                      src={form.image}
                      alt="Product preview"
                      className="w-16 h-16 rounded-lg object-cover border border-forest-100 bg-sand/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-forest-900 font-medium truncate" title={form.image}>
                        {form.image}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="text-xs text-forest-700 hover:text-forest-950 font-medium underline cursor-pointer"
                        >
                          {uploadingImage ? "Uploading..." : "Replace Image"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, image: "" }));
                            setUploadNotice("");
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drag and drop upload zone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-forest-600 bg-forest-50/70"
                        : "border-forest-200 hover:border-forest-400 bg-white/70"
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-2 space-y-2">
                        <div className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium text-forest-800">Uploading to Cloud Storage...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1.5">
                        <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="text-xs font-medium text-forest-900">
                          Click to upload from device or drag and drop
                        </p>
                        <p className="text-[11px] text-forest-700/60">
                          PNG, JPG, WEBP, GIF up to 10MB (Cloudinary supported)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Notice or Error */}
                {uploadNotice && (
                  <p className="text-[11px] text-emerald-700 font-medium">{uploadNotice}</p>
                )}
                {uploadError && (
                  <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
                )}

                {/* Direct URL input toggle */}
                <div className="pt-1">
                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="text-[11px] text-forest-700/70 hover:text-forest-900 underline cursor-pointer"
                    >
                      Or paste an external Image URL
                    </button>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-forest-700">Direct Image URL</span>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="text-[10px] text-forest-700/60 hover:text-forest-900"
                        >
                          Hide
                        </button>
                      </div>
                      <input
                        placeholder="https://images.unsplash.com/... or CDN link"
                        value={form.image}
                        onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                        className="input-field text-xs py-2"
                        required={!form.image}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className="input-field"
                  required
                />
                <input
                  placeholder="SKU"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  className="input-field"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                />
                Featured product
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? "Save changes" : "Create product"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
