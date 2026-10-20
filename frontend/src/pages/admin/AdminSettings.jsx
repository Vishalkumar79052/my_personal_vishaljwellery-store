import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import {
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Store,
  DollarSign,
  Phone,
  Mail,
  MapPin,
} from "../../components/icons/LucideIcons.jsx";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    storeName: "Vishal Jewellery Store",
    tagline: "Haute Joaillerie & Certified Solitaires",
    contactEmail: "contact@vishaljewellery.com",
    contactPhone: "+91 98765 43210",
    currency: "USD",
    currencySymbol: "$",
    lowStockThreshold: 5,
    freeShippingThreshold: 500,
    storeAddress: "104 Heritage Jewellers Boulevard, Zaveri Bazaar, Mumbai 400002, India",
    aboutStory: "Dedicated to handcrafted timeless bridal jewelry, solitaire diamonds, and precious gemstone heirlooms.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSettings = () => {
    setLoading(true);
    api
      .get("/admin/settings")
      .then((res) => {
        if (res.data) setSettings(res.data);
      })
      .catch((err) => {
        console.warn("Could not load settings:", err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.put("/admin/settings", settings);
      setSettings(res.data);
      setNotice("Store settings and operational preferences saved successfully.");
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update store settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Boutique Settings
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Maison Preferences
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Configure boutique identity, currency displays, low-stock thresholds, and showroom contact details.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs self-start sm:self-auto"
          title="Reload Settings"
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

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form (2 Columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Brand Identity Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Store className="w-4 h-4 text-emerald-900" />
              <h3 className="font-display font-bold text-base text-stone-900">Brand Identity & Story</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Maison Store Name</label>
                <input
                  type="text"
                  required
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Maison Heritage Story</label>
                <textarea
                  rows={3}
                  value={settings.aboutStory}
                  onChange={(e) => setSettings({ ...settings, aboutStory: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
              </div>
            </div>
          </div>

          {/* Operational Thresholds Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <DollarSign className="w-4 h-4 text-emerald-900" />
              <h3 className="font-display font-bold text-base text-stone-900">Currency & Inventory Thresholds</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Display Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="AED">AED (د.إ - UAE Dirham)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Low-Stock Alert Threshold (Units)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
                <p className="text-[10px] text-stone-400 mt-1">Triggers warnings on executive dashboard</p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Free Insured Shipping Threshold ($)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
                <p className="text-[10px] text-stone-400 mt-1">Orders above this qualify for free shipping</p>
              </div>
            </div>
          </div>

          {/* Showroom & Concierge Contact Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Phone className="w-4 h-4 text-emerald-900" />
              <h3 className="font-display font-bold text-base text-stone-900">Showroom & Contact</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1"> Phone / WhatsApp</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Flagship Showroom Address</label>
                <textarea
                  rows={2}
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary !text-xs !py-3 !px-6 shadow-xs disabled:opacity-50"
            >
              {saving ? "Saving Preferences..." : "Save Boutique Settings"}
            </button>
          </div>
        </form>

        {/* Live Preview Card (1 Column) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4 sticky top-24">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Live Boutique Card
            </span>

            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-stone-200/70 space-y-3">
              <div>
                <h4 className="font-display font-bold text-lg text-emerald-950">{settings.storeName}</h4>
                <p className="text-[11px] font-semibold text-amber-800 tracking-wider uppercase mt-0.5">
                  {settings.tagline}
                </p>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed italic">
                "{settings.aboutStory}"
              </p>

              <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Mail className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  <span className="truncate">{settings.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Phone className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  <span>{settings.contactPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight text-stone-600">{settings.storeAddress}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Security Note</p>
              <p className="text-[11px] text-emerald-800/80">

              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
