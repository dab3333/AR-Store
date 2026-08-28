import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const SCROLL_REVEAL_THRESHOLD = 40;

const CartIcon = () => (
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
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17l5-5-5-5M21 12H9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M4.5 20c1.4-3.5 4.3-5.5 7.5-5.5s6.1 2 7.5 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export default function Navbar() {
  const { isAuthenticated, isAdmin, username, logout } = useAuth();
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const accountMenuRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!userMenuOpen && !accountMenuOpen) return;
    const onClickOutside = (e) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (accountMenuOpen && accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [userMenuOpen, accountMenuOpen]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > SCROLL_REVEAL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const isOverlay = isHome && !scrolled;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      closeMenus();
      setMobileSearchOpen(false);
    }
  };

  const handleLogout = () => {
    closeMenus();
    logout();
    navigate("/login");
  };

  const closeMenus = () => {
    setUserMenuOpen(false);
    setAccountMenuOpen(false);
  };

  return (
    <header className={`navbar${isHome ? " navbar-home" : ""}${isOverlay ? " navbar-overlay" : ""}`}>
      <div className="container navbar-inner">
        <Link
          to="/"
          className="brand"
          onClick={() => {
            closeMenus();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Ar Store
        </Link>

        <form
          className={`navbar-search${mobileSearchOpen ? " mobile-search-open" : ""}`}
          onSubmit={handleSearch}
        >
          <input
            ref={mobileSearchInputRef}
            type="search"
            placeholder="Search t-shirts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <SearchIcon />
          </button>
          {mobileSearchOpen && (
            <button
              type="button"
              className="navbar-search-close"
              aria-label="Close search"
              onClick={() => setMobileSearchOpen(false)}
            >
              &times;
            </button>
          )}
        </form>

        <nav className="navbar-links">
          {isAdmin && <Link to="/admin">Admin</Link>}
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Link
                  to="/cart"
                  className="cart-link"
                  id="cart-icon"
                  aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
                >
                  <CartIcon />
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
                    {!isAdmin && (
                      <Link to="/liked" className="user-menu-item" onClick={closeMenus}>
                        <HeartIcon />
                        Liked products
                      </Link>
                    )}
                    <button type="button" className="user-menu-item" onClick={handleLogout}>
                      <LogoutIcon />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>

        <div className="account-menu" ref={accountMenuRef}>
          <button
            className="account-menu-trigger"
            onClick={() => setAccountMenuOpen((o) => !o)}
            aria-label="Account menu"
            aria-expanded={accountMenuOpen}
          >
            <UserIcon />
            {isAuthenticated && itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
          {accountMenuOpen && (
            <div className="user-menu-dropdown account-menu-dropdown">
              <button
                type="button"
                className="user-menu-item"
                onClick={() => {
                  setAccountMenuOpen(false);
                  setMobileSearchOpen(true);
                }}
              >
                <SearchIcon />
                Search
              </button>
              {isAuthenticated ? (
                <>
                  <div className="user-menu-heading">@{username}</div>
                  {isAdmin ? (
                    <Link to="/admin" className="user-menu-item" onClick={closeMenus}>
                      Admin
                    </Link>
                  ) : (
                    <>
                      <Link to="/cart" className="user-menu-item" onClick={closeMenus}>
                        <CartIcon />
                        Cart{itemCount > 0 ? ` (${itemCount})` : ""}
                      </Link>
                      <Link to="/liked" className="user-menu-item" onClick={closeMenus}>
                        <HeartIcon />
                        Liked products
                      </Link>
                    </>
                  )}
                  <button type="button" className="user-menu-item" onClick={handleLogout}>
                    <LogoutIcon />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="user-menu-item" onClick={closeMenus}>
                    Login
                  </Link>
                  <Link to="/register" className="user-menu-item" onClick={closeMenus}>
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
