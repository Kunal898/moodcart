import api from './api';

export async function apiRegister(email, password, fullName) {
  const { data } = await api.post('/api/auth/register', { email, password, fullName });
  return data;
}

export async function apiLogin(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
}

export async function apiAutoApprove(email) {
  const { data } = await api.post('/api/auth/auto-approve', { email });
  return data;
}
