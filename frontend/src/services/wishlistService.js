import api from './api';

export const getWishlist = () => api.get('/api/wishlist');
export const addToWishlist = (productId) => api.post('/api/wishlist', { product_id: productId });
export const removeFromWishlist = (productId) => api.delete(`/api/wishlist/${productId}`);
