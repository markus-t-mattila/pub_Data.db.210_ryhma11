import { useCart } from "../context/cartContext";
import { cancelReservation } from "../services/api";

export default function ReservationBar() {
  const {
    cartItems,
    timeLeft,
    reservationExpired,
    clearCart,
    extendReservation,
  } = useCart();

  if (cartItems.length === 0 && !reservationExpired) return null;

  // Tyhjennä koko ostoskori ja vapauta kaikki varaukset
  const handleClearCart = async () => {
    try {
      for (const item of cartItems) {
        await cancelReservation(item.book_id);
      }
      clearCart();
    } catch (err) {
      alert("Virhe tyhjentäessä ostoskoria: " + err);
      clearCart()
    }
  };

  return (
    <div className="bg-yellow-100 text-black px-4 py-2 text-sm border-b border-yellow-300">
      {reservationExpired ? (
        <p className="text-red-600 font-semibold">
          Ostoskorisi on tyhjennetty varauksen vanhentumisen vuoksi.
        </p>
      ) : (
        <div className="flex justify-between items-center">
          <span>
          {(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = Math.floor(timeLeft % 60);
            return (
              <>
                Varausaikaa jäljellä: <strong>{minutes} min {seconds} sek</strong>
              </>
            );
          })()}
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              onClick={extendReservation}
            >
              Jatka varausta
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              onClick={handleClearCart}
            >
              Peruuta varaus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
