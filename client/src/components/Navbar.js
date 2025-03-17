import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo / Nimi */}
        <div className="text-xl font-bold">
          <Link to="/">📚 Keskusdivari</Link>
        </div>

        {/* Navigointilinkit */}
        <div className="flex flex-grow justify-evenly">
          <Link to="/" className="hover:underline">Etusivu</Link>
          <Link to="/login" className="hover:underline">Kirjaudu</Link>
          <Link to="/register" className="hover:underline">Rekisteröidy</Link>
          <Link to="/dashboard" className="hover:underline">Oma sivu</Link>
        </div>

        {/* Hakukenttä ja hae-painike */}
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
