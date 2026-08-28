import { useEffect, useState } from "react";

const CLOSE_ANIMATION_MS = 180;

export default function Modal({ title, onClose, wide = false, children }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, CLOSE_ANIMATION_MS);
  };

  return (
    <div
      className={`modal-overlay ${closing ? "is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={`modal ${wide ? "modal-wide" : ""} ${closing ? "is-closing" : ""}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
            &times;
          </button>
        </div>
        {typeof children === "function" ? children(handleClose) : children}
      </div>
    </div>
  );
}
