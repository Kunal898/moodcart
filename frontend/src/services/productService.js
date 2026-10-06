import api from './api';

export const getProducts = (params) => api.get('/api/products', { params });
export const getProductById = (id) => api.get(`/api/products/${id}`);
export const createProduct = (data) => api.post('/api/products', data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);
export const uploadProductImage = (formData) =>
  api.post('/api/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
