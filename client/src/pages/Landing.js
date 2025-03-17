import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { testBackend } from "../services/api";

export default function Landing() {
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState("");

  const checkBackendConnection = async () => {
    const response = await testBackend();
    setBackendStatus(response.message);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Tervetuloa Keskusdivariin</h1>
      <p className="text-lg text-gray-600 mb-6">Osta ja myy kirjoja helposti.</p>

      <div className="space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Kirjaudu
        </button>

        <button
          onClick={() => navigate("/register")}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition"
        >
          Rekisteröidy
        </button>

        {/* Testaa backend-yhteys -nappi */}
        <button
          onClick={checkBackendConnection}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Testaa yhteys
        </button>
      </div>

      {backendStatus && (
        <p className="mt-4 text-lg font-semibold">{backendStatus}</p>
      )}
    </div>
  );
}