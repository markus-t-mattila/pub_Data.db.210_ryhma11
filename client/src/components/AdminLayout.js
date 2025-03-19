import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAdminSession } from "../services/api";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutStatus, setLogoutStatus] = useState(false); // 🔥 Uusi logout-tila

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await getAdminSession();
        setAdmin(response.data.admin || null);
      } catch (error) {
        setAdmin(null);
      }
      setLoading(false);
    };
    checkAdminSession();
  }, []);

  useEffect(() => {
    if (!loading && admin === null && !logoutStatus) {
      setLogoutStatus(true); // 🔥 Estetään ylimääräiset ohjaukset
      navigate("/admin/login");
    }
  }, [loading, admin, navigate]);

  if (loading) {
    return <p>Ladataan...</p>;
  }

  return (
    <div>
      <AdminNavbar adminSession={admin} />
      <Outlet />
    </div>
  );
}
