import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookById, reserveBook, cancelReservation } from "../services/api";
import { useCart } from "../context/cartContext";
import Swal from "sweetalert2";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function SingleBook() {
  const { id } = useParams(); // haetaan book_id URL-parametrista
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();

  const isInCart = cartItems.some(item => item.book_id === book?.book_id);

  const handleAddToCart = async () => {
    try {
      const result = await reserveBook(book.book_id);
      addToCart(result.book);

      await Swal.fire({
        title: "✅ Keskusdivari",
        text: result.message,
        icon: "success",
        confirmButtonText: "OK"
      });

    } catch (err) {
      await Swal.fire({
        title: "❌ Varauksen epäonnistuminen",
        text: err?.response?.data?.error || "Tuntematon virhe",
        icon: "error"
      });
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      await cancelReservation(book.book_id);
      removeFromCart(book.book_id);

      await Swal.fire({
        title: "✅ Keskusdivari",
        text: "Kirja poistettiin ostoskorista ja varaus peruutettiin.",
        icon: "success",
        confirmButtonText: "OK"
      });

    } catch (err) {
      await Swal.fire({
        title: "❌ Virhe poistaessa",
        text: err?.response?.data?.error || "Varauksen peruutus epäonnistui.",
        icon: "error"
      });
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(id);
        if (Array.isArray(data) && data.length > 0) {
          setBook(data[0]); // palautus on array
        }
      } catch (error) {
        console.error("Virhe kirjan haussa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) return <p className="p-6 text-blue-600">🔄 Ladataan kirjan tietoja...</p>;
  if (!book) return <p className="p-6 text-red-600">Kirjaa ei löytynyt.</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 hover:underline transition mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Takaisin
      </button>
      <h1 className="text-2xl font-bold mb-6">📘 {book.name}</h1>

      <div className="bg-white shadow-md rounded p-6 border border-gray-200">
        <p><strong>Kirjailija:</strong> {book.writer}</p>
        <p><strong>Vuosi:</strong> {book.year}</p>
        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Tyyppi:</strong> {book.type}</p>
        <p><strong>Luokka:</strong> {book.class}</p>
        <p><strong>Kunto:</strong> {book.condition}</p>
        <p><strong>Paino:</strong> {book.weight} g</p>
        <p><strong>Hinta:</strong> {parseFloat(book.sale_price).toFixed(2)} €</p>
        <p><strong>Tila:</strong> {book.status}</p>
        <hr className="my-4" />
        <p className="font-semibold">📍 Myyjä:</p>
        <p>{book.store}</p>
        <p>{book.store_email}</p>
        <p>{book.store_phone}</p>

        {/* 🛒 Ostoskoripainike */}
        <div className="mt-6">
          {!isInCart ? (
            <button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
            >
              ➕ Lisää ostoskoriin
            </button>
          ) : (
            <button
              onClick={handleRemoveFromCart}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
            >
              ❌ Poista ostoskorista
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
