export function Loading({ label = "Loading..." }) {
  return <div className="status-message loading">{label}</div>;
}

export function ErrorMessage({ error, fallback = "Something went wrong. Please try again." }) {
  const message =
    error?.response?.data?.message || error?.response?.data?.error || error?.message;
  return <div className="status-message error">{message || fallback}</div>;
}

export function EmptyState({ label = "Nothing to show here yet." }) {
  return <div className="status-message empty">{label}</div>;
}
