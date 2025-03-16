import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/auth/register", {
        name,
        email,
        password,
      });

      if (response.data.success) {
        navigate("/login");
      }
    } catch (err) {
      setError("Rekisteröinti epäonnistui.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Rekisteröidy</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleRegister}>
          <label className="block mb-2">Nimi</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700"
          >
            Rekisteröidy
          </button>
        </form>
      </div>
    </div>
  );
}
