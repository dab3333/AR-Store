import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPeso } from "../utils/currency";
import { Loading, ErrorMessage } from "../components/StatusMessage";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getProduct(id);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setAdding(true);
    setMessage(null);
    try {
      await addItem(product.id);
      setMessage({ type: "success", text: "Added to cart." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Could not add to cart.",
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loading label="Loading product..." />;
  if (error) return <ErrorMessage error={error} />;
  if (!product) return null;

  const outOfStock = (product.stock ?? 0) <= 0;

  return (
    <div className="container section product-detail">
      <Link to="/" className="back-link">
        &larr; Continue shopping
      </Link>
      <div className="product-detail-grid">
        <div className="product-detail-img">
          <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="price">{formatPeso(product.price)}</p>
          {product.rating != null && (
            <p className="rating">&#9733; {Number(product.rating).toFixed(1)}</p>
          )}
          <p className={outOfStock ? "stock stock-out" : "stock stock-in"}>
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </p>

          <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={outOfStock || adding}
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          {product.externalUrl && (
            <a
              href={product.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              View more details
            </a>
          )}

          {message && (
            <p className={message.type === "success" ? "form-success" : "form-error"}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
