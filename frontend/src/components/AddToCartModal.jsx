import { useRef, useState } from "react";
import Modal from "./Modal";
import { formatPeso } from "../utils/currency";
import { flyToCart } from "../utils/flyToCart";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { DEFAULT_SIZES, DEFAULT_COLORS, parseOptionList } from "../utils/productOptions";

export default function AddToCartModal({ product, sourceImg, onClose }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const sizes = parseOptionList(product.sizes, DEFAULT_SIZES);
  const colors = parseOptionList(product.colors, DEFAULT_COLORS);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);
  const stock = product.stock ?? 0;

  const handleAdd = async (closeModal) => {
    setSubmitting(true);
    setError(null);
    try {
      await addItem(product.id, { size: selectedSize, color: selectedColor, qty });
      flyToCart(sourceImg || imgRef.current);
      showToast(`Added ${product.name} to cart.`);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add to cart.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add to cart" onClose={onClose} wide>
      {(closeModal) => (
        <div className="add-to-cart-modal">
          <div className="add-to-cart-modal-preview">
            <img ref={imgRef} src={product.imageUrl || "/placeholder.svg"} alt={product.name} />
          </div>
          <div className="add-to-cart-modal-body">
            <h3>{product.name}</h3>
            <p className="price">{formatPeso(product.price)}</p>

            <div className="product-option-group">
              <h4>Size</h4>
              <div className="product-option-pills">
                {sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={`product-option-pill${size === selectedSize ? " is-selected" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="product-option-group">
              <h4>Color</h4>
              <div className="product-option-pills">
                {colors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={`product-option-pill${color === selectedColor ? " is-selected" : ""}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="product-option-group">
              <h4>Quantity</h4>
              <div className="qty-control">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  -
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(stock, q + 1))}
                  disabled={qty >= stock}
                >
                  +
                </button>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAdd(closeModal)}
                disabled={submitting || stock < 1}
              >
                {submitting ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
