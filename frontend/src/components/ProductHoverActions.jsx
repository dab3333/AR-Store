import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLikes } from "../context/LikesContext";
import AddToCartModal from "./AddToCartModal";

export default function ProductHoverActions({ product }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { isLiked, toggleLike } = useLikes();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const sourceImgRef = useRef(null);
  const liked = isLiked(product.id);
  const outOfStock = (product.stock ?? 0) <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    sourceImgRef.current = e.currentTarget.closest("a")?.querySelector("img") || null;
    setModalOpen(true);
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
    <>
      <ul className="product-hover-icons">
        <li>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={outOfStock ? "Out of stock" : "Add to cart"}
            title={outOfStock ? "Out of stock" : "Add to cart"}
          >
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
      {modalOpen && (
        <AddToCartModal
          product={product}
          sourceImg={sourceImgRef.current}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
