import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, ShieldCheck, Lock, ArrowRight } from "../components/icons/LucideIcons.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirectPath =
        location.state?.from || (user.role === "admin" ? "/admin" : "/user/dashboard");
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-16 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-luxury space-y-6 relative z-10">
        {/* Monogram Seal */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-forest-950 text-amber-300 flex items-center justify-center font-editorial font-bold text-lg border border-amber-300/40 shadow-xs mx-auto">
            VJ
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-950">
            Welcome to the Maison
          </h1>
          <p className="text-xs text-stone-500">
            Sign in to access your orders, saved jewels, and patron privileges.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Account Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3.5 shadow-gold text-center justify-center mt-2"
          >
            <span>{loading ? "Authenticating…" : "Sign In to Account"}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
          <span>New to Vishal Jewellery? </span>
          <Link to="/register" className="font-bold text-forest-950 hover:text-gold-700 hover:underline">
            Join the Maison
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
          <Lock className="w-3 h-3 text-emerald-800" />
          <span>256-bit Encrypted Luxury Portal</span>
        </div>
      </div>
    </div>
  );
};

export default Login;