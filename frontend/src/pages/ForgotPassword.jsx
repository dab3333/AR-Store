import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/endpoints";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section auth-page">
      <div className="auth-form">
        <h1>Forgot password</h1>
        {sent ? (
          <>
            <p className="form-success">
              If an account exists for {email}, a password reset link has been sent.
            </p>
            <Link className="btn btn-primary" to="/login">
              Back to login
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
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
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send reset link"}
            </button>
            <div className="auth-links">
              <Link to="/login">Back to login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
