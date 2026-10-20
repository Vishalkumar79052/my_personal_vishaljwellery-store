import { useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Users,
  Lock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Key,
  Phone,
  Mail,
  Calendar,
  Sparkles,
} from "../../components/icons/LucideIcons.jsx";

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Personal Info State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoSaving(true);
    setInfoSuccess("");
    setInfoError("");

    try {
      const { data } = await api.put("/auth/profile", {
        name,
        phone,
      });
      updateUser(data);
      setInfoSuccess("Personal details updated successfully.");
    } catch (err) {
      setInfoError(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setInfoSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters in length.");
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      setPasswordSaving(false);
      return;
    }

    try {
      const { data } = await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(data.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Could not update password. Verify current password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft">
        <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
          Patron Account
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
          Profile & Security
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Review your account credentials, update contact telephone for dispatch notifications, and manage password security.
        </p>
      </div>

      {/* Account Overview Snapshot */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 font-display text-2xl font-bold flex items-center justify-center shadow-md">
              {user?.name?.charAt(0).toUpperCase() || "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl text-amber-100">{user?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  {user?.role === "admin" ? "Maison Administrator" : "Privileged Patron"}
                </span>
              </div>
              <p className="text-xs text-stone-300 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-emerald-800/60 text-xs text-stone-300">
            <span className="text-[11px] text-stone-400">Patron Since</span>
            <span className="font-semibold text-amber-200">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "2026"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
            <Users className="w-5 h-5 text-emerald-900" />
            <h3 className="font-display font-bold text-base text-stone-900">Personal Information</h3>
          </div>

          {infoSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{infoSuccess}</span>
            </div>
          )}

          {infoError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{infoError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateInfo} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Primary identifier cannot be modified online for vault security.
              </span>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Contact Telephone (for delivery alerts)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={infoSaving}
                className="px-6 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {infoSaving ? "Saving…" : "Update Information"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
            <Lock className="w-5 h-5 text-emerald-900" />
            <h3 className="font-display font-bold text-base text-stone-900">Security Credentials</h3>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-100 font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {passwordSaving ? "Updating Password…" : "Update Security Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security and Role Notice */}
      <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200 flex items-center gap-3 text-xs text-stone-600">
        <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0" />
        <p>
          <strong>Account Privacy Guarantee:</strong> Your patron privileges, order manifests, and delivery addresses are encrypted and strictly guarded. Administrative roles cannot be self-elevated.
        </p>
      </div>
    </div>
  );
};

export default Profile;
