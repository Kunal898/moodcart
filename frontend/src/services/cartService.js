import api from './api';

export const getCart = () => api.get('/api/cart');
export const addToCart = (product_id, quantity) => api.post('/api/cart', { product_id, quantity });
export const updateCartItem = (id, quantity) => api.put(`/api/cart/${id}`, { quantity });
export const removeFromCart = (id) => api.delete(`/api/cart/${id}`);
