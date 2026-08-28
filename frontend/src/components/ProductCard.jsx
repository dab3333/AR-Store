import { Link } from "react-router-dom";
import { formatPeso } from "../utils/currency";
import ProductHoverActions from "./ProductHoverActions";

export default function ProductCard({ product, className = "" }) {
  const outOfStock = (product.stock ?? 0) <= 0;
  return (
    <Link to={`/products/${product.id}`} className={`product-card${className ? ` ${className}` : ""}`}>
      <div className="product-card-img">
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
        />
        {outOfStock && <span className="badge badge-out">Out of stock</span>}
        {product.featured && !outOfStock && <span className="badge badge-featured">Featured</span>}
        <ProductHoverActions product={product} />
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
