import { useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    password: "",
    address: {
      fullName: user?.address?.fullName || "",
      line1: user?.address?.line1 || "",
      line2: user?.address?.line2 || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "",
      phone: user?.address?.phone || "",
    },
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddressChange = (e) =>
    setForm((f) => ({ ...f, address: { ...f.address, [e.target.name]: e.target.value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = { name: form.name, address: form.address };
      if (form.password) payload.password = form.password;
      const { data } = await api.put("/auth/profile", payload);
      updateUser(data);
      setForm((f) => ({ ...f, password: "" }));
      setMessage("Profile updated");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Profile</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <input value={user?.email} disabled className="input-field bg-sand/50 cursor-not-allowed" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">New password (leave blank to keep current)</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="input-field"
          />
        </div>

        <h2 className="font-display text-xl pt-4">Default shipping address</h2>
        <input name="fullName" value={form.address.fullName} onChange={handleAddressChange} placeholder="Full name" className="input-field" />
        <input name="line1" value={form.address.line1} onChange={handleAddressChange} placeholder="Address line 1" className="input-field" />
        <input name="line2" value={form.address.line2} onChange={handleAddressChange} placeholder="Address line 2" className="input-field" />
        <div className="grid grid-cols-2 gap-4">
          <input name="city" value={form.address.city} onChange={handleAddressChange} placeholder="City" className="input-field" />
          <input name="state" value={form.address.state} onChange={handleAddressChange} placeholder="State" className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="postalCode" value={form.address.postalCode} onChange={handleAddressChange} placeholder="Postal code" className="input-field" />
          <input name="country" value={form.address.country} onChange={handleAddressChange} placeholder="Country" className="input-field" />
        </div>
        <input name="phone" value={form.address.phone} onChange={handleAddressChange} placeholder="Phone" className="input-field" />

        {message && <p className="text-sm text-forest-600">{message}</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
