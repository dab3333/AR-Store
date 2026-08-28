import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPeso } from "../utils/currency";
import { Loading, ErrorMessage } from "../components/StatusMessage";

const REVIEW_POOL = [
  { name: "Jerome T.", text: "Sulit sa presyo, ang lambot ng fabric and true to size pa." },
  { name: "Cassandra P.", text: "Fast shipping and the print quality is really solid, walang crack after ilang wash." },
  { name: "Miko D.", text: "Ordered this as a gift and they loved it. Comfy fit, hindi manipis." },
  { name: "Angeline R.", text: "Second time ko na umorder dito, consistent yung quality every time." },
  { name: "Paolo S.", text: "Design translated really well onto the shirt, mas maganda pa sa picture." },
  { name: "Trisha M.", text: "Good for everyday wear, breathable yung tela kahit mainit." },
];

function pickReviews(seed, count = 3) {
  const start = Math.abs(seed) % REVIEW_POOL.length;
  return Array.from({ length: count }, (_, i) => REVIEW_POOL[(start + i) % REVIEW_POOL.length]);
}

const DEFAULT_SIZES = "S,M,L,XL";
const DEFAULT_COLORS = "Black,White";

function parseList(value, fallback) {
  const raw = value && value.trim() ? value : fallback;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDescription(product) {
  const collection = product.collectionName ? ` from our ${product.collectionName}` : "";
  return `The ${product.name} is a fan-favorite pick${collection}. Printed on soft, breathable cotton with a comfortable unisex fit, it's built to hold up to regular wear and washing without losing its shape or print quality. Whether you're keeping it casual, styling it for a con, or just repping your favorite characters day to day, it's an easy shirt to reach for.`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();
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

  const handleEdit = () => {
    navigate("/admin/products", { state: { editProductId: product.id } });
  };

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
  const sizes = parseList(product.sizes, DEFAULT_SIZES);
  const colors = parseList(product.colors, DEFAULT_COLORS);

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

          {isAdmin ? (
            <button className="btn btn-primary" onClick={handleEdit}>
              Edit product
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>

              {message && (
                <p className={message.type === "success" ? "form-success" : "form-error"}>
                  {message.text}
                </p>
              )}
            </>
          )}

          <div className="product-description">
            <h3>Description</h3>
            <p>{buildDescription(product)}</p>
          </div>

          <div className="product-options">
            <div className="product-option-group">
              <h4>Available sizes</h4>
              <div className="product-option-pills">
                {sizes.map((size) => (
                  <span key={size} className="product-option-pill">
                    {size}
                  </span>
                ))}
              </div>
            </div>
            <div className="product-option-group">
              <h4>Available colors</h4>
              <div className="product-option-pills">
                {colors.map((color) => (
                  <span key={color} className="product-option-pill">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="product-reviews">
        <h3>Customer Reviews</h3>
        <div className="product-reviews-list">
          {pickReviews(product.id).map((r) => (
            <div key={r.name} className="product-review">
              <div className="rating">★★★★★</div>
              <p>&ldquo;{r.text}&rdquo;</p>
              <span className="product-review-author">{r.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
