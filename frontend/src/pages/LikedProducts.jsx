import { useEffect, useRef, useState } from "react";
import { getProduct } from "../api/endpoints";
import { useLikes } from "../context/LikesContext";
import ProductCard from "../components/ProductCard";
import { Loading, EmptyState } from "../components/StatusMessage";

const REMOVE_ANIMATION_MS = 280;

export default function LikedProducts() {
  const { likedIds } = useLikes();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState(() => new Set());
  const prevIdsRef = useRef(new Set());
  const initialLoadDone = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const prevIds = prevIdsRef.current;
    const currentIds = likedIds;
    prevIdsRef.current = new Set(currentIds);

    async function sync() {
      if (!initialLoadDone.current) {
        setLoading(true);
        const ids = [...currentIds];
        const results = await Promise.all(
          ids.map((id) =>
            getProduct(id)
              .then((res) => res.data)
              .catch(() => null)
          )
        );
        if (cancelled) return;
        setProducts(results.filter(Boolean));
        setLoading(false);
        initialLoadDone.current = true;
        return;
      }

      const removed = [...prevIds].filter((id) => !currentIds.has(id));
      const added = [...currentIds].filter((id) => !prevIds.has(id));

      if (removed.length > 0) {
        setRemovingIds((prev) => {
          const next = new Set(prev);
          removed.forEach((id) => next.add(id));
          return next;
        });
        setTimeout(() => {
          if (cancelled) return;
          setProducts((prev) => prev.filter((p) => !removed.includes(p.id)));
          setRemovingIds((prev) => {
            const next = new Set(prev);
            removed.forEach((id) => next.delete(id));
            return next;
          });
        }, REMOVE_ANIMATION_MS);
      }

      if (added.length > 0) {
        const newProducts = await Promise.all(
          added.map((id) =>
            getProduct(id)
              .then((res) => res.data)
              .catch(() => null)
          )
        );
        if (cancelled) return;
        setProducts((prev) => [...prev, ...newProducts.filter(Boolean)]);
      }
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [likedIds]);

  return (
    <div className="container section liked-page">
      <h1>Liked Products</h1>
      {loading && <Loading label="Loading liked products..." />}
      {!loading && products.length === 0 && (
        <EmptyState label="You haven't liked any products yet." />
      )}
      {!loading && products.length > 0 && (
        <div className="grid products-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              className={removingIds.has(p.id) ? "is-removing" : ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}
