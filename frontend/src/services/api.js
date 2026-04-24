import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
  // Usa a URL da variável de ambiente no deploy, ou localhost no desenvolvimento
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
});

axiosRetry(api, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
  }
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