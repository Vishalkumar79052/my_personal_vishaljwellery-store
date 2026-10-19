import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-24 text-forest-700/60">Loading…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-24 text-forest-700/60">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
