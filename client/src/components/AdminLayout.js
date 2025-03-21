import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  const { admin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && admin === null) {
      navigate("/admin/login");
    }
  }, [loading, admin, navigate]);

  if (loading) {
    return <p>Ladataan...</p>;
  }

  return (
    <div>
      <AdminNavbar />
      <Outlet />
    </div>
  );
}
