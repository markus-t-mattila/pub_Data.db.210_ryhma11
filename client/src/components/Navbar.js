import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/cartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import SearchBar from "../pages/SeachBar";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, login } = useContext(AuthContext);
  const { cartItems } = useCart();

  console.log("Navbar cartItems:", cartItems);
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "login-success") {
        login(); // Päivittää AuthContextin
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [login]);


  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* Vasen: Logo */}
        <div className="text-xl font-bold text-center md:text-left">
          <Link to="/books">📚 Keskusdivari</Link>
        </div>

        {/* Keskellä: Navigaatio */}
        <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
          {[
            { to: "/", label: "Etusivu" },
            !isLoggedIn && { to: "/login", label: "Kirjaudu" },
            !isLoggedIn && { to: "/register", label: "Rekisteröidy" },
            isLoggedIn && { to: "/profile", label: "Oma sivu" },
            isLoggedIn && { onClick: handleLogout, label: "Kirjaudu ulos" },
            { to: "/customers-stats", label: "Käyttäjätilastot" },
            { to: "/classes", label: "Teosluokat" },
            { to: "/books", label: "Kirjat" }
          ]
            .filter(Boolean)
            .map((item, index) =>
              item.to ? (
                <Link
                  key={index}
                  to={item.to}
                  className="px-3 py-1 rounded-md hover:bg-blue-500 transition"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="px-3 py-1 rounded-md hover:bg-blue-500 transition"
                >
                  {item.label}
                </button>
              )
            )}

          {/* Ostoskori-linkki */}
          <Link to="/shopping-cart" className="relative flex items-center gap-1 px-3 py-1 rounded-md hover:bg-blue-500 transition">
            <ShoppingCartIcon
              className={`h-6 w-6 transition ${cartItems.length > 0 ? "text-yellow-300" : "text-white"}`}
            />
            <span>Ostoskori</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>

        {/* Oikealla: Hakukenttä */}
        <SearchBar />
      </div>
    </nav>
  );
}
