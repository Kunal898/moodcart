import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../services/cartService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await getCart();
      setCartItems(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function addItem(productId, quantity = 1) {
    const { data } = await addToCart(productId, quantity);
    await fetchCart();
    return data;
  }

  async function updateItem(id, quantity) {
    await updateCartItem(id, quantity);
    await fetchCart();
  }

  async function removeItem(id) {
    await removeFromCart(id);
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ cartItems, loading, cartCount, subtotal, addItem, updateItem, removeItem, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
