import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api.js";

export default function Register() {
  // Lomakkeen tilat
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");

  const [error, setError] = useState("");

  // React Routerin navigate, jotta voidaan siirtää käyttäjä toiseen reittiin
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Kutsutaan registerCustomer-funktiota,
      // joka on määritelty services/api.js -tiedostossa
      const response = await registerCustomer({
        name,
        email,
        password,
        phone,
        street_address: streetAddress, // Huomaa kentän nimi
        postcode,
        city,
      });

      // Riippuen siitä, miten backend vastaa, tarkista data:
      // Esim. jos backend palauttaa { success: true, message: '...' }
      if (response.status === 201) {
        // Onnistuneen rekisteröinnin jälkeen siirrytään /login-näkymään
        navigate("/login");
      } else {
        // Jos success ei ole true, tulkitaan se virheeksi
        setError(response.data.error || "Rekisteröinti epäonnistui.");
      }
    } catch (err) {
      if (err.response) {
        // Virheen käsittely, jos backend palauttaa virheen
        setError(err.response.data.error);
      } else {
        // Jos virhe ei ole axiosin palauttama virhe, logitetaan se konsoliin
        console.error(err);
        setError("Rekisteröinti epäonnistui.");
      }
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

          <label className="block mb-2">Puhelin</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label className="block mb-2">Katuosoite</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            required
          />

          <label className="block mb-2">Postinumero</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            required
          />

          <label className="block mb-2">Kaupunki</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
