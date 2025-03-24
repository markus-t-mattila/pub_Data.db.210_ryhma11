import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginCustomer } from "../services/api";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginModal() {
  const { forceLogin, setForceLogin, login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  if (!forceLogin) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await loginCustomer(email, password);
      if (result.data.success) {
        login();
        setForceLogin(false);
      } else {
        setError(result.data.error || "Kirjautuminen epäonnistui.");
      }
    } catch (err) {
      setError("Kirjautuminen epäonnistui.");
    }
  };

  const handleClose = () => {
    setForceLogin(false);
    if (location.pathname === "/profile") {
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow w-96 relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-xl font-bold"
        >
          <XMarkIcon className="h-7 w-7 font-bold" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Kirjaudu jatkaaksesi</h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Sähköposti"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 mb-3 border"
          />
          <input
            type="password"
            placeholder="Salasana"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 mb-4 border"
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Kirjaudu
          </button>
        </form>
      </div>
    </div>
  );
}
