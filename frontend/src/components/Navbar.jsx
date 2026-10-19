import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  const isAdminPage = location.pathname.startsWith("/admin");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/shop?keyword=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-forest-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
        <Link to="/" className="font-display text-2xl tracking-tight text-forest-800 shrink-0">
          Vishal jewellery Store
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for considered jewellerys…"
            className="input-field rounded-full"
          />
        </form>

        <nav className="flex items-center gap-6 ml-auto text-sm font-medium">
          {!isAdminPage && (
            <>
              <Link to="/shop" className="hover:text-forest-600 transition-colors">
                Shop
              </Link>
              <Link to="/cart" className="relative hover:text-forest-600 transition-colors">
                Cart
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-clay-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" && (
                isAdminPage ? (
                  <Link
                    to="/"
                    className="btn-secondary !px-3.5 !py-1.5 text-xs inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Storefront
                  </Link>
                ) : (
                  <Link
                    to="/admin"
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold px-3.5 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    Admin Dashboard
                  </Link>
                )
              )}
              <Link
                to="/dashboard"
                className="hover:text-forest-600 transition-colors text-xs font-medium"
              >
                My Account
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn-secondary !px-3.5 !py-1.5 text-xs font-medium"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="btn-secondary !px-4 !py-1.5 text-xs font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary !px-4 !py-1.5 text-xs font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
