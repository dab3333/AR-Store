import { useEffect, useState } from "react";
import {
  adminGetCollections,
  adminCreateCollection,
  adminUpdateCollection,
  adminDeleteCollection,
} from "../../api/endpoints";
import { Loading, ErrorMessage, EmptyState } from "../../components/StatusMessage";
import ConfirmModal from "../../components/ConfirmModal";
import Modal from "../../components/Modal";

const emptyForm = { name: "", imageUrl: "" };

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminGetCollections();
      setCollections(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (collection) => {
    setEditingId(collection.id);
    setForm({ name: collection.name || "", imageUrl: collection.imageUrl || "" });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e, closeModal) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await adminUpdateCollection(editingId, form);
      } else {
        await adminCreateCollection(form);
      }
      await load();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save collection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteCollection(pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not delete collection.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-toolbar">
        <button className="btn btn-primary" onClick={openAdd}>
          + Add collection
        </button>
      </div>

      {loading && <Loading label="Loading collections..." />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && collections.length === 0 && (
        <EmptyState label="No collections yet." />
      )}
      {!loading && !error && collections.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id}>
                <td>
                  <img src={c.imageUrl || "/placeholder.svg"} alt={c.name} className="admin-thumb" />
                </td>
                <td>{c.name}</td>
                <td className="admin-actions">
                  <button className="link-btn" onClick={() => openEdit(c)}>
                    Edit
                  </button>
                  <button className="link-btn danger" onClick={() => setPendingDelete(c)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <Modal title={editingId ? "Edit collection" : "Add collection"} onClose={() => setModalOpen(false)} wide>
          {(closeModal) => (
            <form className="modal-form-preview" onSubmit={(e) => handleSubmit(e, closeModal)}>
              <div className="modal-form-fields">
                <div className="form-field">
                  <label htmlFor="col-name">Name</label>
                  <input
                    id="col-name"
                    required
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="col-image">Image URL</label>
                  <input
                    id="col-image"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="/uploads/example.png"
                  />
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : editingId ? "Update collection" : "Add collection"}
                  </button>
                </div>
              </div>
              <div className="modal-form-preview-pane">
                <span className="modal-form-preview-label">Preview</span>
                <div className="modal-form-preview-img">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Preview" onError={(e) => (e.currentTarget.src = "/placeholder.svg")} />
                  ) : (
                    <img src="/placeholder.svg" alt="No image yet" />
                  )}
                </div>
              </div>
            </form>
          )}
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete collection"
          message={`Delete "${pendingDelete.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
