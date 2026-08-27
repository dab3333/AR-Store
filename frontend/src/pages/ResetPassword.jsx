import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/endpoints";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing or invalid reset token.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section auth-page">
      <div className="auth-form">
        <h1>Reset password</h1>
        {done ? (
          <>
            <p className="form-success">Your password has been reset. You can now log in.</p>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              Go to login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Resetting..." : "Reset password"}
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
