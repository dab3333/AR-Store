import { useEffect, useState } from "react";
import { getCollections, getProducts } from "../api/endpoints";
import CollectionCard from "../components/CollectionCard";
import ProductCard from "../components/ProductCard";
import { Loading, ErrorMessage, EmptyState } from "../components/StatusMessage";

export default function Home() {
  const [collections, setCollections] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [collectionsRes, featuredRes, latestRes] = await Promise.all([
          getCollections(),
          getProducts({ featured: true }),
          getProducts(),
        ]);
        if (cancelled) return;
        setCollections(collectionsRes.data || []);
        setFeatured(featuredRes.data || []);
        const all = latestRes.data || [];
        setLatest([...all].reverse().slice(0, 8));
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
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-content">
          <span className="hero-badge">50% SALE OFF</span>
          <h1>Affordable, Customized Shirts</h1>
          <p>Anime, games, and pop-culture inspired T-shirts, delivered anywhere in the Philippines.</p>
          <a href="#collections" className="btn btn-primary">
            Shop now
          </a>
        </div>
      </section>

      {loading && <Loading label="Loading storefront..." />}
      {error && <ErrorMessage error={error} />}

      {!loading && !error && (
        <>
          <section id="collections" className="section container">
            <h2>Collections</h2>
            {collections.length === 0 ? (
              <EmptyState label="No collections available yet." />
            ) : (
              <div className="grid collections-grid">
                {collections.map((c) => (
                  <CollectionCard key={c.id} collection={c} />
                ))}
              </div>
            )}
          </section>

          <section className="section container">
            <h2>Featured</h2>
            {featured.length === 0 ? (
              <EmptyState label="No featured products right now." />
            ) : (
              <div className="grid products-grid">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>

          <section className="section container">
            <h2>Latest</h2>
            {latest.length === 0 ? (
              <EmptyState label="No products available yet." />
            ) : (
              <div className="grid products-grid">
                {latest.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
