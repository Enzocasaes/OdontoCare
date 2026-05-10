import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
let csrfToken = null;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

const loadCsrfToken = async () => {
  if (csrfToken) return csrfToken;
  const response = await api.get('/csrf-token');
  csrfToken = response.data.csrfToken;
  return csrfToken;
};

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const isMutating = ['post', 'put', 'patch', 'delete'].includes(method);
  const skipCsrf = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'].includes(config.url);

  if (isMutating && !skipCsrf) {
    const token = await loadCsrfToken();
    config.headers['csrf-token'] = token;
  }

  return config;
});

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401, limpa o token e redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('odontocare_token');
      localStorage.removeItem('odontocare_user');
      setAuthToken(null);
      
      // Redireciona para login se não estiver em uma rota de auth
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
