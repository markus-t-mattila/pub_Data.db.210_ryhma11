import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, getAdminSession } from "../services/api";

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      try {
        const response = await getAdminSession();
        if (response.data?.admin) {
          onLoginSuccess(response.data.admin);
          navigate("/admin/dashboard");
        }
      } catch (error) {
        // Ei tehdä mitään, jos admin ei ole kirjautunut
      }
    };
    checkIfLoggedIn();
  }, [navigate, onLoginSuccess]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginAdmin(email, password);
      console.log("🔥 Login response:", response); // 🔥 Debug-logi

      // 🔥 Tarkistetaan, että vastaus on oikeassa muodossa
      if (response && response.data && response.data.success === true) {
        console.log("✅ Kirjautuminen onnistui, haetaan istunto...");

        // 🔥 Hakee päivitetyn admin-sessionin
        const sessionResponse = await getAdminSession();
        console.log("🔥 Päivitetty sessio:", sessionResponse);

        onLoginSuccess(sessionResponse.data.admin);
        navigate("/admin/dashboard");
      } else {
        console.error("❌ Kirjautumisvirhe: Väärä vastausmuoto", response);
        setError(response.data?.error || "Kirjautuminen epäonnistui.");
      }
    } catch (err) {
      console.error("❌ Virhe kirjautumisessa:", err);
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
