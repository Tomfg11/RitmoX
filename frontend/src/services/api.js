import axios from 'axios';

const api = axios.create({
  // Usa a URL da variável de ambiente no deploy, ou localhost no desenvolvimento
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Interceptor para injetar o Token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@RitmoX:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;