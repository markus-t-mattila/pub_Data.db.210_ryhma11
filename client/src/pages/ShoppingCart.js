import { useCart } from "../context/cartContext";
import { Link } from "react-router-dom";
import { cancelReservation } from "../services/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ShoppingCart() {
  const { cartItems, shippingCost, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useContext(AuthContext);

  // Poista yksittäinen kirja + peruu varauksen
  const handleRemoveItem = async (bookId) => {
    try {
      await cancelReservation(bookId);
      removeFromCart(bookId);
    } catch (err) {
      alert("Varauksen peruutus epäonnistui: " + err);
    }
  };

  // Tyhjennä koko ostoskori ja vapauta kaikki varaukset
  const handleClearCart = async () => {
    try {
      for (const item of cartItems) {
        await cancelReservation(item.book_id);
      }
      clearCart();
    } catch (err) {
      alert("Virhe tyhjentäessä ostoskoria: " + err);
    }
  };

  const totalShippingCost =  shippingCost?.totalCost || 0;
  console.log("totalShippingCost:", totalShippingCost);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">🛒 Ostoskorisi</h2>

      {cartItems.length === 0 ? (
        <div className="text-gray-700">
          <p>Ostoskorisi on tyhjä.</p>
          <Link to="/books" className="text-blue-600 underline">Siirry selaamaan kirjoja</Link>
        </div>
      ) : (
        <>
          <table className="min-w-full table-auto border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Nimi</th>
                <th className="px-4 py-2 border">Hinta (€)</th>
                <th className="px-4 py-2 border">Kunto</th>
                <th className="px-4 py-2 border">Paino (g)</th>
                <th className="px-4 py-2 border">Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.book_id} className="text-center">
                  <td className="px-4 py-2 border">
                    <Link to={`/book/${item.book_id}`} className="text-blue-600 hover:underline">
                      {item.title_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border">{parseFloat(item.sale_price).toFixed(2)}</td>
                  <td className="px-4 py-2 border">{item.condition}</td>
                  <td className="px-4 py-2 border">{item.weight} g</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleRemoveItem(item.book_id)}
                      className="text-red-600 hover:underline"
                    >
                      Poista
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Yhteenveto</h3>
          
            <div className="flex justify-between mb-2">
              <span>Tuotteiden hinta yhteensä:</span>
              <span>
                {cartItems
                  .reduce((sum, item) => sum + parseFloat(item.sale_price), 0)
                  .toFixed(2)} €
              </span>
            </div>
          
            <div className="flex justify-between mb-2">
              <span>Toimituskulut yhteensä:</span>
              <span>
                {shippingCost && shippingCost.totalCost > 0 
                 ? `${shippingCost.totalCost.toFixed(2)} €`
                 : 'Lasketaan...'}
              </span>
            </div>
          
            <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
              <span>Kokonaishinta:</span>
              <span>
                {shippingCost && shippingCost.totalCost > 0
                  ? `${(
                    cartItems.reduce((sum, item) => sum + parseFloat(item.sale_price), 0) +
                    shippingCost.totalCost
                    ).toFixed(2)} €`
                  : 'Lasketaan...'}
              </span>
            </div>

            <button
              onClick={handleClearCart}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Tyhjennä ostoskori
            </button>
            <div className="mt-4">
              {isLoggedIn ? (
                <button
                  onClick={() => alert("Vahvistusnappi toimii, mutta ei vielä tee mitään.")}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  ✅ Vahvista ja tilaa
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => window.open("/popup/login", "_blank", "width=600,height=600")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Kirjaudu ja tilaa
                  </button>
                  <button
                    onClick={() => window.open("/popup/register", "_blank", "width=600,height=600")}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Rekisteröidy ja tilaa
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
