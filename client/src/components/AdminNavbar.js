import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminSession, logoutAdmin } from "../services/api";
import { useAdminAuth } from "../context/AdminAuthContext.js";

export default function AdminNavbar() {
    const navigate = useNavigate();
    const { admin, setAdmin } = useAdminAuth(); // Päivitetään admin-tila automaattisesti

    useEffect(() => {
      const checkAdminSession = async () => {
        try {
          const response = await getAdminSession();
          setAdmin(response.data.admin || null); // Navbar päivittyy heti
        } catch (error) {
          setAdmin(null);
        }
      };
      checkAdminSession();
    }, [setAdmin]); // Tämä varmistaa päivityksen

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
            {/* Disabled temporarily */}
            {/* <Link to="/admin/add-admin" className="hover:underline">Add Admin</Link> */}
            <Link to="/admin/customers-stats" className="hover:underline">Käyttäjätilastot</Link>
            <Link to="/admin/add-book" className="hover:underline">Lisää kirja</Link>
            <Link to="/admin/add-store" className="hover:underline">Lisää divari</Link>
            <button onClick={handleLogout} className="hover:underline">Kirjaudu ulos</button>
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
