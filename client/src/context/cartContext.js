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
  };

  return (
    <CartContext.Provider value={{ cartItems, shippingCost, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
