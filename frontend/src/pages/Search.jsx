import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "../api/endpoints";
import ProductCard from "../components/ProductCard";
import { Loading, ErrorMessage, EmptyState } from "../components/StatusMessage";

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await searchProducts(q);
        if (!cancelled) setProducts(data || []);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (q) {
      load();
    } else {
      setProducts([]);
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="container section">
      <h1>Search results for &ldquo;{q}&rdquo;</h1>
      {loading && <Loading label="Searching..." />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState label="No products matched your search." />
      )}
      {!loading && !error && products.length > 0 && (
        <div className="grid products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
