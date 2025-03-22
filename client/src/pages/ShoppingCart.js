import { useCart } from "../context/cartContext";
import { Link } from "react-router-dom";

export default function ShoppingCart() {
  const { cartItems, removeFromCart, clearCart } = useCart();

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
                  <td className="px-4 py-2 border">{item.title_name}</td>
                  <td className="px-4 py-2 border">{parseFloat(item.sale_price).toFixed(2)}</td>
                  <td className="px-4 py-2 border">{item.condition}</td>
                  <td className="px-4 py-2 border">{item.weight} g</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => removeFromCart(item.book_id)}
                      className="text-red-600 hover:underline"
                    >
                      Poista
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-6">
            <p className="font-semibold">
              Yhteensä:{" "}
              {cartItems
                .reduce((sum, item) => sum + parseFloat(item.sale_price), 0)
                .toFixed(2)}{" "}
              €
            </p>
            <button
              onClick={clearCart}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Tyhjennä ostoskori
            </button>
          </div>
        </>
      )}
    </div>
  );
}
