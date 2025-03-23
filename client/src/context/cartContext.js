import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { calculateShippingCost, extendReservation } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [shippingCost, setShippingCost] = useState({ totalCost: 0, batches: [] });
  const [reservationExpired, setReservationExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // sekunteina

  const oldestTimestampRef = useRef(null);

  // Päivitä vanhin timestamp ja käynnistä varauskello
  useEffect(() => {
    if (cartItems.length === 0) {
      oldestTimestampRef.current = null;
      setTimeLeft(null);
      return;
    }

    const oldest = cartItems.reduce((oldest, item) => {
      const current = new Date(item.modified_at);
      return (!oldest || current < oldest) ? current : oldest;
    }, null);

    oldestTimestampRef.current = oldest;
    setReservationExpired(false);
  }, [cartItems]);

  // Sekuntikello joka laskee aikaa
  useEffect(() => {
    const interval = setInterval(() => {
      if (!oldestTimestampRef.current) return;

      const elapsed = (Date.now() - new Date(oldestTimestampRef.current).getTime()) / 1000;
      const remaining = Math.max(298 - elapsed, 0); // max 5 min (299s)

      setTimeLeft(remaining);

      if (remaining <= 0 && cartItems.length > 0) {
        clearCart();
        setReservationExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cartItems]);

  // Toimituskulut
  
  const fetchShippingCost = async (items) => {
    try {
      const weights = items.map(item => Number(item.weight));
      if (weights.length === 0) {
        setShippingCost({ totalCost: 0, batches: [] });
        return;
      }
      const response = await calculateShippingCost(weights);
      setShippingCost({
        totalCost: response.totalCost,
        batches: response.batches
      });
    } catch (error) {
      console.error('Virhe toimituskulujen laskennassa:', error);
      setShippingCost({ totalCost: 0, batches: [] });
    }
  };

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book) => {
    const updatedCart = [...cartItems, book];
    setCartItems(updatedCart);
    fetchShippingCost(updatedCart);
    console.log("Lisätty kirja ostoskoriin:", {
      book_id: book.book_id,
      modified_at: book.modified_at
    });
    //setCartItems((prevItems) => [...prevItems, book]);
  };

  const removeFromCart = (bookId) => {
    const updatedCart = cartItems.filter((item) => item.book_id !== bookId);
    setCartItems(updatedCart);
    fetchShippingCost(updatedCart);
    //setCartItems((prevItems) => prevItems.filter((item) => item.book_id !== bookId));
  };

  const clearCart = () => {
    setCartItems([]);
    setShippingCost({ totalCost: 0, batches: [] });
    localStorage.removeItem('cartItems');
    setTimeLeft(null);
  };

  const extendCurrentReservation = async () => {
    try {
      const payload = {
        books: cartItems.map((item) => ({
          book_id: item.book_id,
          modified_at: item.modified_at
        })),
      };

      const response = await extendReservation(payload);
      console.log("extendCurrentReservation response:", response);
      if (response.updatedBooks) {
        setCartItems(response.updatedBooks);
        setReservationExpired(false);
        console.log("Varausta jatkettu.");
      } else {
        console.warn("Varausta ei voitu jatkaa.");
      }
    } catch (error) {
      console.error("Virhe varauksen jatkamisessa:", error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      shippingCost,
      addToCart,
      removeFromCart,
      clearCart,
      reservationExpired,
      timeLeft,
      extendReservation: extendCurrentReservation
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
