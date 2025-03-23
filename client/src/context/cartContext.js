import { createContext, useState, useContext, useEffect } from 'react';
import { calculateShippingCost } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // tila toimituskuluille
  const [shippingCost, setShippingCost] = useState({ totalCost: 0, batches: [] });
  const [oldestTimestamp, setOldestTimestamp] = useState(null);
  const [reservationExpired, setReservationExpired] = useState(false);

  // Kuuntele viesti popupilta
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "reservation-declined") {
        clearCart();
        setReservationExpired(true);
      }

      if (event.data === "reservation-extended") {
        const updatedCart = JSON.parse(localStorage.getItem("cartItems"));
        setCartItems(updatedCart);
        setReservationExpired(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Päivitä vanhin aikaleima kun ostoskori muuttuu
  useEffect(() => {
    if (cartItems.length === 0) {
      setOldestTimestamp(null);
      return;
    }

    const oldest = cartItems.reduce((oldest, item) => {
      const current = new Date(item.modified_at);
      return (!oldest || current < oldest) ? current : oldest;
    }, null);

    setOldestTimestamp(oldest);
  }, [cartItems]);

  // Kello joka valvoo varausaikaa
  useEffect(() => {
    if (!oldestTimestamp) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(oldestTimestamp).getTime()) / 1000;

      if (elapsed >= 240 && elapsed < 245 && !window.reservationPrompted) {
        window.reservationPrompted = true;
        window.open("/popup/extend-reservation", "_blank", "width=500,height=300");
      }

      if (elapsed >= 299) {
        clearCart();
        setReservationExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [oldestTimestamp]);

  // Päivittäa toimituskulut aina kun ostoskori muuttuu
  useEffect(() => {
      const fetchShippingCost = async () => {
        try {
          const weights = cartItems.map(item => Number(item.weight));

          if (weights.length === 0) {
            setShippingCost({ totalCost: 0, batches: [] });
            return;
          }
  
          const response = await calculateShippingCost(weights);
          //console.log('response:', response);
          setShippingCost({
            totalCost: response.totalCost,
            batches: response.batches
          });
        } catch (error) {
          console.error('Virhe toimituskulujen laskennassa:', error);
          setShippingCost({ totalCost: 0, batches: [] });
        }
      };
  
      fetchShippingCost();
    }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book) => {
    setCartItems((prevItems) => [...prevItems, book]);
  };

  const removeFromCart = (bookId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.book_id !== bookId));
  };

  const clearCart = () => {
    setCartItems([]);
    setShippingCost({ totalCost: 0, batches: [] });
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, shippingCost, addToCart, removeFromCart, clearCart, reservationExpired }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
