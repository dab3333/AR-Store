import { useState } from "react";

export default function ConfirmModal({
  title,
  message,
  requirePassword = false,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  busy = false,
  error = null,
}) {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    onConfirm(requirePassword ? password : undefined);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>{title}</h3>
        <p>{message}</p>
        {requirePassword && (
          <div className="form-field">
            <label htmlFor="admin-password">Confirm your admin password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={busy || (requirePassword && !password)}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
