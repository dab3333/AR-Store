import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  getCollections,
} from "../../api/endpoints";
import { formatPeso } from "../../utils/currency";
import { Loading, ErrorMessage, EmptyState } from "../../components/StatusMessage";
import ConfirmModal from "../../components/ConfirmModal";
import Modal from "../../components/Modal";
import ImageUploadField from "../../components/ImageUploadField";

const PAGE_SIZE = 8;

const emptyForm = {
  name: "",
  imageUrl: "",
  price: "",
  stock: "",
  rating: "",
  featured: false,
  collectionId: "",
  sizes: "",
  colors: "",
};

export default function AdminProducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [filterCollectionId, setFilterCollectionId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCollections = async () => {
    try {
      const { data } = await getCollections();
      setCollections(data || []);
    } catch {
      // non-fatal for the product list
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminGetProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!filterCollectionId) return products;
    return products.filter((p) => String(p.collectionId) === String(filterCollectionId));
  }, [products, filterCollectionId]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleFilterChange = (value) => {
    setFilterCollectionId(value);
    setPage(1);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      imageUrl: product.imageUrl || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      rating: product.rating ?? "",
      featured: Boolean(product.featured),
      collectionId: product.collectionId ?? "",
      sizes: product.sizes || "",
      colors: product.colors || "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  useEffect(() => {
    const editProductId = location.state?.editProductId;
    if (!editProductId || products.length === 0) return;
    const product = products.find((p) => String(p.id) === String(editProductId));
    if (product) {
      openEdit(product);
    }
    navigate(location.pathname, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, location.state]);

  const handleSubmit = async (e, closeModal) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        rating: form.rating === "" ? null : Number(form.rating),
        collectionId: form.collectionId === "" ? null : form.collectionId,
      };
      if (editingId) {
        await adminUpdateProduct(editingId, payload);
      } else {
        await adminCreateProduct(payload);
      }
      await loadProducts();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(pendingDelete.id);
      setPendingDelete(null);
      await loadProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not delete product.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-filter-bar">
        <div className="admin-filter-select">
          <label htmlFor="filter-collection">Collection</label>
          <select
            id="filter-collection"
            value={filterCollectionId}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">All collections</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <span className="admin-filter-count">
          {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading && <Loading label="Loading products..." />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && filteredProducts.length === 0 && (
        <EmptyState label="No products yet." />
      )}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagedProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img src={p.imageUrl || "/placeholder.svg"} alt={p.name} className="admin-thumb" />
                  </td>
                  <td>{p.name}</td>
                  <td>{formatPeso(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{p.featured ? "Yes" : "No"}</td>
                  <td className="admin-actions">
                    <button className="link-btn" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button className="link-btn danger" onClick={() => setPendingDelete(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && filteredProducts.length > PAGE_SIZE && (
        <div className="admin-pagination">
          <span className="admin-pagination-label">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            title="Previous page"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            title="Next page"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="admin-section-toolbar">
        <button className="btn btn-primary" onClick={openAdd}>
          + Add product
        </button>
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit product" : "Add product"} onClose={() => setModalOpen(false)} wide>
          {(closeModal) => (
            <form className="modal-form-preview" onSubmit={(e) => handleSubmit(e, closeModal)}>
              <div className="modal-form-fields">
                <div className="form-field">
                  <label htmlFor="p-name">Name</label>
                  <input
                    id="p-name"
                    required
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <ImageUploadField
                  id="p-image"
                  label="Image"
                  value={form.imageUrl}
                  onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                  showThumbnail={false}
                />
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="p-price">Price (₱)</label>
                    <input
                      id="p-price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="p-stock">Stock</label>
                    <input
                      id="p-stock"
                      type="number"
                      min="0"
                      required
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="p-rating">Rating</label>
                    <input
                      id="p-rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="p-sizes">Available sizes</label>
                    <input
                      id="p-sizes"
                      placeholder="S, M, L, XL"
                      value={form.sizes}
                      onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="p-colors">Available colors</label>
                    <input
                      id="p-colors"
                      placeholder="Black, White"
                      value={form.colors}
                      onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="p-collection">Collection</label>
                  <select
                    id="p-collection"
                    required
                    value={form.collectionId}
                    onChange={(e) => setForm((f) => ({ ...f, collectionId: e.target.value }))}
                  >
                    <option value="">Select a collection</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field form-field-checkbox">
                  <label htmlFor="p-featured">
                    <input
                      id="p-featured"
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    />
                    Featured
                  </label>
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : editingId ? "Update product" : "Add product"}
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
                      alt="Product preview"
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
          title="Delete product"
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
