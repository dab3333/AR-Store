import { useEffect, useState } from "react";
import { adminGetOrders } from "../../api/endpoints";
import { formatPeso } from "../../utils/currency";
import { Loading, ErrorMessage, EmptyState } from "../../components/StatusMessage";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await adminGetOrders();
        if (!cancelled) setOrders(data || []);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loading label="Loading orders..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="admin-section">
      {orders.length === 0 ? (
        <EmptyState label="No orders yet." />
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</td>
                <td>{o.status}</td>
                <td>
                  {(o.items || [])
                    .map((it) => `${it.name} x${it.qty}`)
                    .join(", ")}
                </td>
                <td>{formatPeso(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
