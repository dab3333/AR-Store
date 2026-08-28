import { Link, useLocation, Navigate } from "react-router-dom";
import { formatPeso } from "../utils/currency";

export default function CheckoutConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container section">
      <div className="checkout-confirmation">
        <h1>Thank you for your order!</h1>
        <p>Your order has been placed successfully.</p>

        <div className="order-summary">
          <div className="order-summary-row">
            <span>Order #</span>
            <span>{order.id}</span>
          </div>
          {order.createdAt && (
            <div className="order-summary-row">
              <span>Date</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          )}
          {order.status && (
            <div className="order-summary-row">
              <span>Status</span>
              <span>{order.status}</span>
            </div>
          )}

          {order.items && order.items.length > 0 && (
            <ul className="order-items">
              {order.items.map((item, i) => {
                const variant = [item.size, item.color].filter(Boolean).join(" / ");
                return (
                  <li key={`${item.productId}-${i}`} className="order-item">
                    <span>
                      {item.name}
                      {variant && ` (${variant})`} &times; {item.qty}
                    </span>
                    <span>{formatPeso(item.price * item.qty)}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="order-summary-row order-total">
            <span>Total</span>
            <span>{formatPeso(order.total)}</span>
          </div>
        </div>

        <Link className="btn btn-primary" to="/">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
