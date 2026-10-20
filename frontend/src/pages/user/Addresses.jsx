import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Star,
} from "../../components/icons/LucideIcons.jsx";

const initialForm = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: "",
  isDefault: false,
};

const Addresses = () => {
  const { user, updateUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/addresses");
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setAddresses([]);
      setError("Unable to load saved addresses.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setForm({
      ...initialForm,
      fullName: user?.name || "",
      phone: user?.phone || "",
      isDefault: addresses.length === 0, // default if first
    });
    setEditingId(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (addr) => {
    setForm({
      fullName: addr.fullName || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      phone: addr.phone || "",
      isDefault: addr.isDefault || false,
    });
    setEditingId(addr._id);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.line1.trim() || !form.city.trim() || !form.postalCode.trim()) {
      setError("Please complete all mandatory address fields.");
      return;
    }

    try {
      setSaving(true);
      let res;
      if (editingId) {
        res = await api.put(`/auth/addresses/${editingId}`, form);
        setSuccess("Delivery address updated successfully.");
      } else {
        res = await api.post("/auth/addresses", form);
        setSuccess("New delivery address registered.");
      }
      setAddresses(res.data);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await api.put(`/auth/addresses/${addressId}/default`);
      setAddresses(res.data);
      setSuccess("Default delivery address updated.");
    } catch (err) {
      setError("Failed to set default address.");
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Remove this delivery address from your account?")) return;
    try {
      setDeletingId(addressId);
      const res = await api.delete(`/auth/addresses/${addressId}`);
      setAddresses(res.data);
      setSuccess("Address removed from account.");
    } catch (err) {
      setError("Failed to delete address.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
            Address Book
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Delivery Addresses
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage your verified residences and secure vault delivery destinations for insured shipments.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
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

      {/* Address List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft animate-pulse space-y-4"
            >
              <div className="w-32 h-4 bg-stone-200 rounded-full" />
              <div className="w-48 h-3 bg-stone-200 rounded-full" />
              <div className="w-40 h-3 bg-stone-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-900 mx-auto flex items-center justify-center">
            <MapPin className="w-8 h-8 stroke-1 text-emerald-900" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900">
              No delivery addresses registered
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Add your residence or private vault address to ensure seamless checkout and insured jewellery dispatch.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-soft flex flex-col justify-between relative ${
                addr.isDefault
                  ? "border-emerald-600/60 ring-1 ring-emerald-600/30 bg-gradient-to-br from-white to-[#F9F8F5]"
                  : "border-stone-200/80 hover:border-amber-300/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-stone-900">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <Star className="w-3 h-3 fill-emerald-800 text-emerald-800" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      title="Edit Address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      disabled={deletingId === addr._id}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-stone-600 leading-relaxed space-y-0.5">
                  <p className="font-medium text-stone-800">{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p className="font-semibold text-stone-700">{addr.country || "India"}</p>
                  {addr.phone && (
                    <p className="text-[11px] text-stone-500 pt-1">Tel: {addr.phone}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 transition-colors"
                  >
                    Set as default destination
                  </button>
                ) : (
                  <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Primary destination
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 my-8 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div>
                <h3 className="font-display font-bold text-lg text-stone-900">
                  {editingId ? "Edit Delivery Address" : "Add Delivery Destination"}
                </h3>
                <p className="text-xs text-stone-500">
                  All shipments are tamper-sealed and hand-delivered via insured courier.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Street Address & Building *
                </label>
                <input
                  type="text"
                  required
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  placeholder="Apartment, suite, or house number and street"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  placeholder="Landmark, floor, wing"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">State / Province</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    placeholder="e.g. 400001"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="India"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <label htmlFor="isDefault" className="text-stone-700 font-medium cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold transition-colors shadow-xs disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingId ? "Update Address" : "Save Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
