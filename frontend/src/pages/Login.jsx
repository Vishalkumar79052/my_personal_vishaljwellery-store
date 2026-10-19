import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

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
      // Seamlessly redirect based on user role or previous destination
      const redirectPath = location.state?.from || (user.role === "admin" ? "/admin" : "/dashboard");
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white rounded-3xl p-8 border border-forest-100 shadow-soft">
        <h1 className="font-display text-3xl mb-2 text-ink">Sign in</h1>
        <p className="text-forest-700/70 mb-8 text-sm">
          Enter your email and password to access your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-forest-800 mb-1.5">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-forest-800 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-forest-100 text-center text-sm text-forest-700/70">
          Don't have an account?{" "}
          <Link to="/register" className="text-forest-800 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;