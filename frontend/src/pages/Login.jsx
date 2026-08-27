import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await login(email, password);
      const from = location.state?.from?.pathname;
      if (data.role === "ADMIN" && !from) {
        navigate("/admin");
      } else {
        navigate(from || "/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create an account</Link>
        </div>
      </form>
    </div>
  );
}
