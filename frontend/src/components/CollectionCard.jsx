import { Link } from "react-router-dom";

export default function CollectionCard({ collection }) {
  return (
    <Link to={`/collections/${collection.id}`} className="collection-card">
      <div className="collection-card-img">
        <img src={collection.imageUrl || "/placeholder.svg"} alt={collection.name} loading="lazy" />
      </div>
      <h3>{collection.name}</h3>
    </Link>
  );
}
