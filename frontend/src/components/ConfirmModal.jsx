import { useState } from "react";
import Modal from "./Modal";

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
    <Modal title={title} onClose={onCancel}>
      {(animatedClose) => (
        <>
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
            <button className="btn btn-secondary" onClick={animatedClose} disabled={busy}>
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
        </>
      )}
    </Modal>
  );
}
