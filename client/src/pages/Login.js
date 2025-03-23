import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api.js";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


// Haetaan login-funktio AuthContextista:
const { login } = useContext(AuthContext);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // kutsutaan loginCustomer-funktiota
      const response = await loginCustomer(email, password);
      // Backendin vastaksesta riippuen
      if (response.data.success) {
        login();
        if (window.opener) {
          // Popup-ikkuna → ilmoita ja sulje
          window.opener.postMessage("login-success", "*");
          window.close();
        } else {
          // Normaali näkymä → siirrytään etusivulle
          navigate("/");
        }  
      } else {
        // Jos success != true, näytetään virhe
        setError(response.data.error || "Kirjautuminen epäonnistui.");
      }
    } catch (err) {
      // 401 / 400 / 500 -virhe, otetaan backendin virheviesti
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Kirjautuminen epäonnistui.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Kirjaudu sisään</h2>
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