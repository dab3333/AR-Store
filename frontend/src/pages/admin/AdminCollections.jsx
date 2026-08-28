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
import ImageUploadField from "../../components/ImageUploadField";
import { useToast } from "../../context/ToastContext";

const emptyForm = { name: "", imageUrl: "" };

export default function AdminCollections() {
  const { showToast } = useToast();
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
        showToast("Collection updated successfully.");
      } else {
        await adminCreateCollection(form);
        showToast("Collection added successfully.");
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
      showToast("Collection deleted successfully.");
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
      {loading && <Loading label="Loading collections..." />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && collections.length === 0 && (
        <EmptyState label="No collections yet." />
      )}
      {!loading && !error && collections.length > 0 && (
        <div className="admin-table-scroll">
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
        </div>
      )}

      <div className="admin-section-toolbar">
        <button className="btn btn-primary" onClick={openAdd}>
          + Add collection
        </button>
      </div>

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
                <ImageUploadField
                  id="col-image"
                  label="Image"
                  value={form.imageUrl}
                  onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                  showThumbnail={false}
                />
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
                <div className={`modal-form-preview-img${form.imageUrl ? "" : " is-empty"}`}>
                  {form.imageUrl ? (
                    <img
                      key={form.imageUrl}
                      src={form.imageUrl}
                      alt="Collection preview"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="modal-form-preview-empty">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
                        <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                        <path
                          d="M4.5 16.5 9 12l3 3 3.5-3.5L19.5 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>No image yet</span>
                    </div>
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
