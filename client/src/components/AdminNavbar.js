import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminSession, logoutAdmin } from "../services/api";

export default function AdminNavbar({ adminSession }) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(adminSession || null);

  // 🔥 Tarkistetaan adminin session jokaisella muutoksella
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await getAdminSession();
        setAdmin(response.data.admin || null);
      } catch (error) {
        setAdmin(null);
      }
    };
    checkAdminSession();
  }, [adminSession]); // 🔥 Tärkeä päivitys

  const handleLogout = async () => {
    await logoutAdmin();
    setAdmin(null);
    navigate("/admin/login");
  };

  return (
    <nav className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/admin" className="hover:underline">🏠 Admin Home</Link>
        </div>

        {admin ? (
          <div className="flex gap-4">
            <Link to="/admin/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/admin/add-admin" className="hover:underline">Add Admin</Link>
            <button onClick={handleLogout} className="hover:underline">Logout</button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/admin/login" className="hover:underline">Kirjaudu</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
