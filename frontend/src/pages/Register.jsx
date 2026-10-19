import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white rounded-3xl p-8 border border-forest-100 shadow-soft">
        <h1 className="font-display text-3xl mb-2 text-ink">Create an account</h1>
        <p className="text-forest-700/70 mb-8 text-sm">
          Join Vishal Jewellery Store to discover curated collections and track orders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-forest-800 mb-1.5">Full name</label>
            <input
              type="text"
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-forest-800 mb-1.5">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-forest-800 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input-field"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-forest-800 mb-1.5">Confirm password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className="input-field"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-forest-100 text-center text-sm text-forest-700/70">
          Already have an account?{" "}
          <Link to="/login" className="text-forest-800 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
