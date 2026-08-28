import { useRef, useState } from "react";
import { adminUploadImage } from "../api/endpoints";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif";

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M12 15V4M12 4 8 8M12 4l4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ImageUploadField({ id, label = "Image", value, onChange, showThumbnail = true }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const { data } = await adminUploadImage(file);
      onChange(data.url);
    } catch (err) {
      setError(err.response?.data?.message || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="image-upload">
        {showThumbnail && (
          <div className="image-upload-thumb">
            <img src={value || "/placeholder.svg"} alt="" />
          </div>
        )}
        <div className="image-upload-main">
          <div className="image-upload-controls">
            <button
              type="button"
              className="icon-btn"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              aria-label={value ? "Change image" : "Choose image"}
              title={value ? "Change image" : "Choose image"}
            >
              <UploadIcon />
            </button>
            {value && !uploading && (
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => onChange("")}
                aria-label="Remove image"
                title="Remove image"
              >
                <TrashIcon />
              </button>
            )}
            {uploading && <span className="image-upload-status">Uploading...</span>}
          </div>
          <p className="image-upload-path" title={value || undefined}>
            {value || "No image selected"}
          </p>
        </div>
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFile}
          hidden
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
