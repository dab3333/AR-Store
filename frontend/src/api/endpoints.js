import client from "./client";

// ---- Auth ----
export const registerUser = (payload) => client.post("/auth/register", payload);
export const verifyEmail = (email, token) =>
  client.get("/auth/verify", { params: { email, token } });
export const loginUser = (payload) => client.post("/auth/login", payload);
export const forgotPassword = (email) => client.post("/auth/forgot-password", { email });
export const resetPassword = (token, newPassword) =>
  client.post("/auth/reset-password", { token, newPassword });

// ---- Catalog ----
export const getCollections = () => client.get("/collections");
export const getCollection = (id) => client.get(`/collections/${id}`);
export const getProducts = (params) => client.get("/products", { params });
export const getProduct = (id) => client.get(`/products/${id}`);
export const searchProducts = (q) => client.get("/products/search", { params: { q } });

// ---- Cart ----
export const getCart = () => client.get("/cart");
export const addCartItem = (productId) => client.post("/cart/items", { productId });
export const updateCartItem = (productId, change) =>
  client.patch(`/cart/items/${productId}`, { change });
export const removeCartItem = (productId) => client.delete(`/cart/items/${productId}`);

// ---- Checkout ----
export const checkout = () => client.post("/checkout");

// ---- Admin: Collections ----
export const adminGetCollections = () => client.get("/admin/collections");
export const adminCreateCollection = (payload) => client.post("/admin/collections", payload);
export const adminUpdateCollection = (id, payload) =>
  client.put(`/admin/collections/${id}`, payload);
export const adminDeleteCollection = (id) => client.delete(`/admin/collections/${id}`);

// ---- Admin: Products ----
export const adminGetProducts = (params) => client.get("/admin/products", { params });
export const adminCreateProduct = (payload) => client.post("/admin/products", payload);
export const adminUpdateProduct = (id, payload) => client.put(`/admin/products/${id}`, payload);
export const adminDeleteProduct = (id) => client.delete(`/admin/products/${id}`);

// ---- Admin: Users ----
export const adminGetUsers = () => client.get("/admin/users");
export const adminDeleteUser = (id, adminPassword) =>
  client.delete(`/admin/users/${id}`, { data: { adminPassword } });

// ---- Admin: Orders ----
export const adminGetOrders = () => client.get("/admin/orders");

// ---- Admin: Uploads ----
export const adminUploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post("/admin/uploads", formData, {
    headers: { "Content-Type": undefined },
  });
};
