import { useState } from "react";
import { registerCustomer } from "../services/api";

export default function RegisterModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await registerCustomer({
        name,
        email,
        password,
        phone,
        street_address: streetAddress,
        postcode,
        city,
      });

      if (response.status === 201) {
        onClose();
        onSuccess(); // Avataan login-modal
      } else {
        setError(response.data.error || "Rekisteröinti epäonnistui.");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        console.error(err);
        setError("Rekisteröinti epäonnistui.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Rekisteröidy</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Nimi" className="w-full p-2 border rounded mb-2" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Sähköposti" className="w-full p-2 border rounded mb-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Salasana" className="w-full p-2 border rounded mb-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="text" placeholder="Puhelin" className="w-full p-2 border rounded mb-2" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <input type="text" placeholder="Katuosoite" className="w-full p-2 border rounded mb-2" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required />
          <input type="text" placeholder="Postinumero" className="w-full p-2 border rounded mb-2" value={postcode} onChange={(e) => setPostcode(e.target.value)} required />
          <input type="text" placeholder="Kaupunki" className="w-full p-2 border rounded mb-4" value={city} onChange={(e) => setCity(e.target.value)} required />
          <div className="flex justify-between">
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Peruuta</button>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Rekisteröidy</button>
          </div>
        </form>
      </div>
    </div>
  );
}
