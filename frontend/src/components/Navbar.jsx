import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { isAuthenticated, isAdmin, username, logout } = useAuth();
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [userMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate("/");
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenus}>
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
          {isAdmin && (
            <Link to="/admin" onClick={closeMenus}>
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Link
                  to="/cart"
                  onClick={closeMenus}
                  className="cart-link"
                  aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                    <path
                      d="M6 8h12l-1.1 10.2a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.8L6 8Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 8V6a3 3 0 0 1 6 0v2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </Link>
              )}

              <div className="user-menu" ref={userMenuRef}>
                <button
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                >
                  @{username}
                </button>
                {userMenuOpen && (
                  <div className="user-menu-dropdown">
                    <button className="link-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenus}>
                Login
              </Link>
              <Link to="/register" onClick={closeMenus}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
