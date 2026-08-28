import { useEffect, useState } from "react";
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
import ImageUploadField from "../../components/ImageUploadField";

const emptyForm = {
  name: "",
  imageUrl: "",
  price: "",
  stock: "",
  rating: "",
  externalUrl: "",
  featured: false,
  collectionId: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [filterCollectionId, setFilterCollectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const params = filterCollectionId ? { collectionId: filterCollectionId } : undefined;
      const { data } = await adminGetProducts(params);
      setProducts(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCollectionId]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      imageUrl: product.imageUrl || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      rating: product.rating ?? "",
      externalUrl: product.externalUrl || "",
      featured: Boolean(product.featured),
      collectionId: product.collectionId ?? "",
    });
  };

  const handleSubmit = async (e) => {
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
      resetForm();
      await loadProducts();
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
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit product" : "Add product"}</h2>
        <div className="form-field">
          <label htmlFor="p-name">Name</label>
          <input
            id="p-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <ImageUploadField
          id="p-image"
          label="Image"
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
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
        <div className="form-field">
          <label htmlFor="p-external">External URL</label>
          <input
            id="p-external"
            value={form.externalUrl}
            onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))}
          />
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
        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : editingId ? "Update product" : "Add product"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-filter">
        <label htmlFor="filter-collection">Filter by collection</label>
        <select
          id="filter-collection"
          value={filterCollectionId}
          onChange={(e) => setFilterCollectionId(e.target.value)}
        >
          <option value="">All collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <Loading label="Loading products..." />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && products.length === 0 && <EmptyState label="No products yet." />}
      {!loading && !error && products.length > 0 && (
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
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={p.imageUrl || "/placeholder.svg"} alt={p.name} className="admin-thumb" />
                </td>
                <td>{p.name}</td>
                <td>{formatPeso(p.price)}</td>
                <td>{p.stock}</td>
                <td>{p.featured ? "Yes" : "No"}</td>
                <td className="admin-actions">
                  <button className="link-btn" onClick={() => handleEdit(p)}>
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
