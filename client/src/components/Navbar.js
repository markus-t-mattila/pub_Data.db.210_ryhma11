import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo / Nimi */}
        <div className="text-xl font-bold">
          <Link to="/">📚 Keskusdivari</Link>
        </div>

        {/* Navigointilinkit - jaetaan koko leveydelle tasaisesti */}
        <div className="flex flex-grow justify-evenly">
          <Link to="/" className="hover:underline">Etusivu</Link>
          <Link to="/login" className="hover:underline">Kirjaudu</Link>
          <Link to="/register" className="hover:underline">Rekisteröidy</Link>
          <Link to="/dashboard" className="hover:underline">Oma sivu</Link> {/* Esimerkki suojatusta sivusta */}
        </div>
        
      </div>
    </nav>
  );
}
