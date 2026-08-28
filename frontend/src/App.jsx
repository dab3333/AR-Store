import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LikesProvider } from "./context/LikesContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";
import ToastContainer from "./components/ToastContainer";
import ScrollToTop from "./components/ScrollToTop";
import ScrollbarAutoHide from "./components/ScrollbarAutoHide";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import CollectionDetail from "./pages/CollectionDetail";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import LikedProducts from "./pages/LikedProducts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <LikesProvider>
          <ToastProvider>
            <ScrollToTop />
            <ScrollbarAutoHide />
            <ToastContainer />
            <Routes>
            <Route element={<Layout />}>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/collections/:id" element={<CollectionDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/liked" element={<LikedProducts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Authenticated */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout-confirmation" element={<CheckoutConfirmation />} />
              </Route>

              {/* Admin */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="collections" replace />} />
                  <Route path="collections" element={<AdminCollections />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="orders" element={<AdminOrders />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </ToastProvider>
          </LikesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
