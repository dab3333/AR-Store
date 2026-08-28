import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLikes } from "../context/LikesContext";

export default function ProductHoverActions({ product }) {
  const { isAuthenticated, isAdmin } = useAuth();
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

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/admin/products", { state: { editProductId: product.id } });
  };

  if (isAdmin) {
    return (
      <ul className="product-hover-icons">
        <li>
          <button type="button" onClick={handleEdit} aria-label="Edit product" title="Edit product">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path
                d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 6l4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </li>
      </ul>
    );
  }

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
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
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
