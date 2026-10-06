import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../services/wishlistService';

const WishlistContext = createContext(null);
const LOCAL_STORAGE_KEY = 'moodcart_guest_wishlist';

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load from local storage for guests
  const loadGuestWishlist = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save guest wishlist to local storage
  const saveGuestWishlist = (items) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems(loadGuestWishlist());
      return;
    }

    try {
      setLoading(true);
      const { data } = await getWishlist();
      // data might be array of { id, product_id, products: {...} }
      // Format consistently so item has .products or is product itself
      const formatted = (data || []).map((row) => ({
        id: row.id || row.product_id,
        product_id: row.product_id,
        product: row.products || row,
      }));
      setWishlistItems(formatted);
    } catch (err) {
      console.warn('Backend wishlist unavailable, falling back to local storage:', err.message);
      setWishlistItems(loadGuestWishlist());
    } finally {
      setLoading(false);
    }
  }, [user, loadGuestWishlist]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback((productId) => {
    return wishlistItems.some((item) => item.product_id === productId || item.id === productId || item.product?.id === productId);
  }, [wishlistItems]);

  const toggleWishlist = async (product) => {
    const productId = product.id || product.product_id;
    const exists = isWishlisted(productId);

    if (exists) {
      // Remove
      if (user) {
        try {
          await apiRemoveFromWishlist(productId);
        } catch (e) {
          console.warn('API error removing from wishlist:', e);
        }
      }
      setWishlistItems((prev) => {
        const updated = prev.filter((item) => (item.product_id || item.id || item.product?.id) !== productId);
        if (!user) saveGuestWishlist(updated);
        return updated;
      });
      return false; // not wishlisted anymore
    } else {
      // Add
      const newItem = {
        id: productId,
        product_id: productId,
        product: product.product || product,
      };

      if (user) {
        try {
          await apiAddToWishlist(productId);
        } catch (e) {
          console.warn('API error adding to wishlist:', e);
        }
      }
      setWishlistItems((prev) => {
        const updated = [newItem, ...prev.filter((i) => (i.product_id || i.id) !== productId)];
        if (!user) saveGuestWishlist(updated);
        return updated;
      });
      return true; // now wishlisted
    }
  };

  const removeFromWishlistState = async (productId) => {
    if (user) {
      try {
        await apiRemoveFromWishlist(productId);
      } catch (e) {
        console.warn('API error removing from wishlist:', e);
      }
    }
    setWishlistItems((prev) => {
      const updated = prev.filter((item) => (item.product_id || item.id || item.product?.id) !== productId);
      if (!user) saveGuestWishlist(updated);
      return updated;
    });
  };

  const moveToCart = async (product) => {
    const productId = product.id || product.product_id;
    await addItem(productId, 1);
    await removeFromWishlistState(productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        loading,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist: removeFromWishlistState,
        moveToCart,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider');
  return context;
}
