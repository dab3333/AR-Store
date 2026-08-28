import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { checkout } from "../api/endpoints";
import { formatPeso } from "../utils/currency";
import { Loading, ErrorMessage, EmptyState } from "../components/StatusMessage";
import ConfirmModal from "../components/ConfirmModal";

export default function Cart() {
  const { items, total, loading, error, updateQty, removeItem, refreshCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();

  const handleQtyChange = async (itemId, change) => {
    try {
      await updateQty(itemId, change);
      setCheckoutError(null);
    } catch (err) {
      setCheckoutError(err.response?.data?.message || "Could not update quantity.");
    }
  };

  const handleRemove = async () => {
    if (!pendingRemove) return;
    setRemoving(true);
    try {
      await removeItem(pendingRemove.id);
      setPendingRemove(null);
      setCheckoutError(null);
    } catch (err) {
      setCheckoutError(err.response?.data?.message || "Could not remove item.");
      setPendingRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const { data: order } = await checkout();
      await refreshCart();
      navigate("/checkout-confirmation", { state: { order } });
    } catch (err) {
      setCheckoutError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <Loading label="Loading your cart..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container section cart-page">
      <h1>Your Cart</h1>
      {items.length === 0 ? (
        <EmptyState label="Your cart is empty." />
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {items.map((item) => {
              const qty = item.qty ?? item.quantity ?? 1;
              const variant = [item.size, item.color].filter(Boolean).join(" / ");
              return (
                <li key={item.id} className="cart-item">
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <Link to={`/products/${item.productId}`}>{item.name}</Link>
                    {variant && <p className="cart-item-variant">{variant}</p>}
                    <p className="price">{formatPeso(item.price)}</p>
                  </div>
                  <div className="qty-control">
                    <button onClick={() => handleQtyChange(item.id, -1)} disabled={qty <= 1}>
                      -
                    </button>
                    <span>{qty}</span>
                    <button onClick={() => handleQtyChange(item.id, 1)}>+</button>
                  </div>
                  <p className="cart-item-subtotal">{formatPeso(item.price * qty)}</p>
                  <button
                    className="link-btn remove-btn"
                    onClick={() => setPendingRemove(item)}
                    aria-label={`Remove ${item.name} from cart`}
                    title="Remove"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                      <path
                        d="M5 7h14M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-row">
              <span>Total</span>
              <span>{formatPeso(total)}</span>
            </div>
            {checkoutError && <p className="form-error">{checkoutError}</p>}
            <button className="btn btn-primary" onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      )}

      {pendingRemove && (
        <ConfirmModal
          title="Remove item"
          message={`Remove "${pendingRemove.name}" from your cart?`}
          confirmLabel="Remove"
          busy={removing}
          onConfirm={handleRemove}
          onCancel={() => setPendingRemove(null)}
        />
      )}
    </div>
  );
}
