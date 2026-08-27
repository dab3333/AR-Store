import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollections, getProducts } from "../api/endpoints";
import { Loading, ErrorMessage, EmptyState } from "../components/StatusMessage";
import { formatPeso } from "../utils/currency";

const TESTIMONIALS = [
  {
    quote: "Nice thing to buy, Second time na ako nag order pero parehong magaganda yung damit",
    name: "Richard Y.",
  },
  {
    quote: "Nice t-shirt and item was shipped immediately, di ako nabigo sa sobrang ganda ng tshirt!",
    name: "Criswell",
  },
  {
    quote: "'Di kami nabigo ng kapatid ko. Look talagang oversized yung black at maganda ang pagkakaprint",
    name: "Kishacian",
  },
  {
    quote: "Shirt fit fine, size chart was pretty accurate. Shipping was fast. The delivery man was approachable.",
    name: "Elinore N.",
  },
];

function StarRating({ value = 5 }) {
  return (
    <div className="rating">
      {"★".repeat(Math.round(value))}
      {"☆".repeat(5 - Math.round(value))}
    </div>
  );
}

function ProductBanner({ title, discount = "70%" }) {
  return (
    <div className="banner-text">
      <h2>
        <span className="discount">{discount}</span> SALE OFF
      </h2>
      <h1>
        <span>Grab Your</span>
        <span>{title}</span>
        <span className="discount">Now!</span>
      </h1>
      <a href="#collections" className="btn">
        Shop now
      </a>
    </div>
  );
}

function LegacyProductGrid({ products }) {
  if (products.length === 0) {
    return <EmptyState label="No products in this collection yet." />;
  }
  return (
    <div className="legacy-product-grid">
      {products.map((p) => (
        <Link key={p.id} to={`/products/${p.id}`} className="legacy-product">
          <div className="legacy-product-header">
            {p.featured && <span className="legacy-product-featured-badge">Featured</span>}
            <img src={p.imageUrl || "/placeholder.svg"} alt={p.name} loading="lazy" />
          </div>
          <div className="legacy-product-footer">
            <h3>{p.name}</h3>
            <StarRating value={p.rating || 5} />
            <div className="price">{formatPeso(p.price)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const [collections, setCollections] = useState([]);
  const [productsByCollection, setProductsByCollection] = useState({});
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
        const [collectionsRes, featuredRes, allRes] = await Promise.all([
          getCollections(),
          getProducts({ featured: true }),
          getProducts(),
        ]);
        if (cancelled) return;
        const collectionsData = collectionsRes.data || [];
        setCollections(collectionsData);
        setFeatured(featuredRes.data || []);
        setLatest([...(allRes.data || [])].reverse().slice(0, 8));

        const perCollection = await Promise.all(
          collectionsData.map((c) => getProducts({ collectionId: c.id }))
        );
        if (cancelled) return;
        const map = {};
        collectionsData.forEach((c, i) => {
          map[c.id] = perCollection[i].data || [];
        });
        setProductsByCollection(map);
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
      <header className="hero">
        <img src="/website-images/cover.png" className="hero-img" alt="" />
        <div className="hero-content">
          <h2>
            <span className="discount">50%</span> SALE OFF
          </h2>
          <h1>
            <span>Affordable</span>
            <span>Customized Shirts</span>
          </h1>
          <a href="#collections" className="btn">
            Shop now
          </a>
        </div>
      </header>

      {loading && <Loading label="Loading storefront..." />}
      {error && <ErrorMessage error={error} />}

      {!loading && !error && (
        <>
          <section id="collections" className="section container">
            <div className="section-title">
              <h1>AR Store Shirt Collections</h1>
            </div>
            {collections.length === 0 ? (
              <EmptyState label="No collections available yet." />
            ) : (
              <div className="advert-grid">
                {collections.map((c) => (
                  <a key={c.id} href={`#collection-${c.id}`}>
                    <div className="advert-box">
                      <div className="dotted">
                        <div className="content">
                          <h2>{c.name}</h2>
                        </div>
                      </div>
                      <img src={c.imageUrl || "/placeholder.svg"} alt="" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {featured.length > 0 && (
            <section className="section container">
              <div className="product-banner">
                <div className="banner-img">
                  <img src={featured[0].imageUrl || "/placeholder.svg"} alt="" />
                </div>
                <ProductBanner title="Featured Picks" />
              </div>
              <div className="section-title">
                <h1>Featured</h1>
              </div>
              <LegacyProductGrid products={featured} />
            </section>
          )}

          {latest.length > 0 && (
            <section className="section container">
              <div className="product-banner">
                <div className="banner-img">
                  <img src={latest[0].imageUrl || "/placeholder.svg"} alt="" />
                </div>
                <ProductBanner title="Latest Drops" />
              </div>
              <div className="section-title">
                <h1>Latest</h1>
              </div>
              <LegacyProductGrid products={latest} />
            </section>
          )}

          {collections.map((c) => {
            const products = productsByCollection[c.id] || [];
            return (
              <section key={c.id} id={`collection-${c.id}`} className="section container">
                <div className="product-banner">
                  <div className="banner-img">
                    <img src={c.imageUrl || "/placeholder.svg"} alt="" />
                  </div>
                  <ProductBanner title={c.name} />
                </div>
                <div className="section-title">
                  <h1>{c.name}</h1>
                </div>
                <LegacyProductGrid products={products} />
              </section>
            );
          })}

          <section className="section container">
            <div className="section-title">
              <h1>Testimonies</h1>
            </div>
            <div className="testimonial-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="testimonial">
                  <span className="quote-mark">&ldquo;</span>
                  <p>{t.quote}</p>
                  <StarRating value={5} />
                  <div className="avatar">{t.name.charAt(0)}</div>
                  <h4>{t.name}</h4>
                </div>
              ))}
            </div>
          </section>

          <section id="About" className="section container">
            <div className="section-title">
              <h1>About Us</h1>
            </div>
            <div className="about-us">
              <p>
                With the rise of the COVID-19 Pandemic, online shops became popular. Ar Store is an example of a
                powerful website that has the ability to fulfill the customers&rsquo; satisfaction and needs. This
                website is dedicated to a clothing shop named Ar Store.
              </p>
              <p>
                Ar Store aims to provide high quality clothing and aesthetically pleasing designs at an affordable
                price. We are located in Quezon City, Philippines. We have 7.9k followers on Shopee with a 4.9/5.0
                overall rating from customers. Our designs are mostly minimalist and based on popular TV shows. Ar
                Store also has 3.4k followers on Facebook and Instagram. We also offer cash on delivery (COD) as a
                payment method for those who want to order our products.
              </p>
              <p>
                We believe that if you can provide good service or product, positive feedback can be spread to your
                business. That is why we hope to provide for all of your needs and satisfaction using our website.
                Your needs are our priority. We always strive to be the best, just for you! Thank you for always
                shopping with us!
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
