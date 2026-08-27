import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container section not-found">
      <h1>404</h1>
      <p>We couldn&rsquo;t find the page you were looking for.</p>
      <Link className="btn btn-primary" to="/">
        Back to home
      </Link>
    </div>
  );
}
