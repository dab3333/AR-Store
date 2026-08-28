import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPeso } from "../utils/currency";
import { Loading, ErrorMessage } from "../components/StatusMessage";
import { flyToCart } from "../utils/flyToCart";
import { DEFAULT_SIZES, DEFAULT_COLORS, parseOptionList } from "../utils/productOptions";

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
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const { isAuthenticated, isAdmin } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const addingRef = useRef(false);
  const imgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getProduct(id);
        if (!cancelled) {
          setProduct(data);
          setSelectedSize(parseOptionList(data.sizes, DEFAULT_SIZES)[0] || null);
          setSelectedColor(parseOptionList(data.colors, DEFAULT_COLORS)[0] || null);
        }
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
    if (addingRef.current) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    addingRef.current = true;
    setAdding(true);
    setMessage(null);
    try {
      await addItem(product.id, { size: selectedSize, color: selectedColor, qty: 1 });
      if (imgRef.current) flyToCart(imgRef.current);
      setMessage({ type: "success", text: "Added to cart." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Could not add to cart.",
      });
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  };

  if (loading) return <Loading label="Loading product..." />;
  if (error) return <ErrorMessage error={error} />;
  if (!product) return null;

  const outOfStock = (product.stock ?? 0) <= 0;
  const sizes = parseOptionList(product.sizes, DEFAULT_SIZES);
  const colors = parseOptionList(product.colors, DEFAULT_COLORS);

  return (
    <div className="container section product-detail">
      <Link to="/" className="back-link">
        &larr; Continue shopping
      </Link>
      <div className="product-detail-grid">
        <div className="product-detail-img">
          <img ref={imgRef} src={product.imageUrl || "/placeholder.svg"} alt={product.name} />
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

          {!isAdmin && (
            <div className="product-options">
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
            </div>
          )}

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
