import api from './api';

export const createOrder = (orderData) => api.post('/api/orders', orderData);
export const getOrders = () => api.get('/api/orders');
export const getOrderById = (id) => api.get(`/api/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/api/orders/${id}/status`, { status });
export const getDashboardStats = () => api.get('/api/orders/stats');
