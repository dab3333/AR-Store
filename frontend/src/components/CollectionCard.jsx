import { Link } from "react-router-dom";

export default function CollectionCard({ collection }) {
  return (
    <Link to={`/collections/${collection.id}`} className="collection-card">
      <div className="collection-card-img">
        <img src={collection.imageUrl || "/placeholder.svg"} alt={collection.name} loading="lazy" />
      </div>
      <div className="collection-card-body">
        <h3>{collection.name}</h3>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}
