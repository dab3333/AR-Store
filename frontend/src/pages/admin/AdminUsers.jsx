import { useEffect, useState } from "react";
import { adminGetUsers, adminDeleteUser } from "../../api/endpoints";
import { Loading, ErrorMessage, EmptyState } from "../../components/StatusMessage";
import ConfirmModal from "../../components/ConfirmModal";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminGetUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (adminPassword) => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await adminDeleteUser(pendingDelete.id, adminPassword);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete user. Check the password.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading label="Loading users..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="admin-section">
      {users.length === 0 ? (
        <EmptyState label="No users yet." />
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className="admin-actions">
                  <button
                    className="link-btn danger"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(u);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete user"
          message={`Delete user "${pendingDelete.username}"? This action is irreversible.`}
          confirmLabel="Delete"
          requirePassword
          busy={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
