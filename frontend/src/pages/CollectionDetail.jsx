import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCollection, getProducts } from "../api/endpoints";
import ProductCard from "../components/ProductCard";
import { Loading, ErrorMessage, EmptyState } from "../components/StatusMessage";

export default function CollectionDetail() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [collectionRes, productsRes] = await Promise.all([
          getCollection(id),
          getProducts({ collectionId: id }),
        ]);
        if (cancelled) return;
        setCollection(collectionRes.data);
        setProducts(productsRes.data || []);
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

  if (loading) return <Loading label="Loading collection..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container section">
      <Link to="/" className="back-link">
        &larr; Back to collections
      </Link>
      <h1>{collection?.name || "Collection"}</h1>
      {products.length === 0 ? (
        <EmptyState label="No products in this collection yet." />
      ) : (
        <div className="grid products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
