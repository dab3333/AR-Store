import { Link } from "react-router-dom";
import { formatPeso } from "../utils/currency";

export default function ProductCard({ product }) {
  const outOfStock = (product.stock ?? 0) <= 0;
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-img">
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
        />
        {outOfStock && <span className="badge badge-out">Out of stock</span>}
        {product.featured && !outOfStock && <span className="badge badge-featured">Featured</span>}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <div className="product-card-meta">
          <span className="price">{formatPeso(product.price)}</span>
          {product.rating != null && (
            <span className="rating">&#9733; {Number(product.rating).toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
