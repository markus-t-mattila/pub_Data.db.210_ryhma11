import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // tai vastaava polku

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Haetaan kontekstista kirjautumistila ja esim. logout-funktio
  const { isLoggedIn, logout } = useContext(AuthContext);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout(); // Kirjaa ulos
    navigate("/"); // palaa etusivulle
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo / Nimi */}
        <div className="text-xl font-bold">
          <Link to="/">📚 Keskusdivari</Link>
        </div>

        {/* Keskiosan navigointilinkit */}
        <div className="flex flex-grow justify-evenly">
          <Link to="/" className="hover:underline">Etusivu</Link>

          {/* Ei kirjautunut → näytetään Kirjaudu ja Rekisteröidy */}
          {!isLoggedIn && (
            <>
              <Link to="/login" className="hover:underline">Kirjaudu</Link>
              <Link to="/register" className="hover:underline">Rekisteröidy</Link>
            </>
          )}

          {/* Kirjautunut → näytetään Oma sivu ja Kirjaudu ulos */}
          {isLoggedIn && (
            <>
              <Link to="/profile" className="hover:underline">Oma sivu</Link>
              <button onClick={handleLogout} className="hover:underline">
                Kirjaudu ulos
              </button>
            </>
          )}
        </div>

        {/* Hakukenttä ja hae-painike, näkyy aina */}
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Etsi kirjoja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-l-md text-black"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-700 transition"
          >
            Hae
          </button>
        </form>

      </div>
    </nav>
  );
}
