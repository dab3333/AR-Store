import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { isAuthenticated, isAdmin, username, logout } = useAuth();
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          Ar Store
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search t-shirts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            Search
          </button>
        </form>

        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          &#9776;
        </button>

        <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="cart-link">
                Cart{itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
              <span className="nav-username">@{username}</span>
              <button className="link-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
