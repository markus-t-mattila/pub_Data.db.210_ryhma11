import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, getAdminSession } from "../services/api";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLogin() {
    const { setAdmin } = useAdminAuth(); // Päivitetään adminin tila automaattisesti
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    useEffect(() => {
      const checkIfLoggedIn = async () => {
        try {
          const response = await getAdminSession();
          if (response.data.admin) {
            setAdmin(response.data.admin); // admin tallentuu automaattisesti
            navigate("/admin/dashboard");
          }
        } catch (error) {}
      };
      checkIfLoggedIn();
    }, [navigate, setAdmin]);
  
    const handleLogin = async (e) => {
      e.preventDefault();
      setError("");
  
      try {
        const response = await loginAdmin(email, password);
  
        if (response.data && response.data.success === true) {
          const sessionResponse = await getAdminSession();
          setAdmin(sessionResponse.data.admin); // Nyt admin tallentuu automaattisesti
          navigate("/admin/dashboard");
        } else {
          setError(response.data?.error || "Kirjautuminen epäonnistui.");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Kirjautuminen epäonnistui.");
      }
    };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin kirjautuminen</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleLogin}>
          <label className="block mb-2">Sähköposti</label>
          <input
            type="email"
            className="w-full p-2 border rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block mb-2">Salasana</label>
          <input
            type="password"
            className="w-full p-2 border rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Kirjaudu
          </button>
        </form>
      </div>
    </div>
  );
}
