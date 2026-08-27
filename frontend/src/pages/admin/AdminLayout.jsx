import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="container section admin-page">
      <h1>Admin Dashboard</h1>
      <nav className="admin-tabs">
        <NavLink to="/admin/collections" className={({ isActive }) => (isActive ? "active" : "")}>
          Collections
        </NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "active" : "")}>
          Products
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
          Users
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          Orders
        </NavLink>
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
