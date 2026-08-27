import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLikes } from "../context/LikesContext";

export default function ProductHoverActions({ product }) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isLiked, toggleLike } = useLikes();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const liked = isLiked(product.id);
  const outOfStock = (product.stock ?? 0) <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || adding) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // swallow - the add-to-cart affordance here is a shortcut; errors are
      // still visible via the full flow on the product detail/cart pages
    } finally {
      setAdding(false);
    }
  };

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(product.id);
  };

  return (
    <ul className="product-hover-icons">
      <li>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          aria-label={outOfStock ? "Out of stock" : "Add to cart"}
          title={outOfStock ? "Out of stock" : "Add to cart"}
          className={added ? "is-active" : ""}
        >
          {added ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
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
          )}
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={handleToggleLike}
          aria-label={liked ? "Remove from liked" : "Add to liked"}
          title={liked ? "Remove from liked" : "Add to liked"}
          className={liked ? "is-active" : ""}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill={liked ? "currentColor" : "none"} aria-hidden="true">
            <path
              d="M12 20.5s-7.5-4.6-9.8-9C.7 8.2 2 4.8 5.2 4.1c2-.4 3.9.5 5 2.2a5.3 5.3 0 0 1 4.6-2.2c3.2.5 4.7 4 3.2 7.4-2.1 4.4-6 6.6-6 9Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </li>
    </ul>
  );
}
