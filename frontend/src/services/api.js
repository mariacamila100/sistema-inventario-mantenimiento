import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE PETICIÓN (Inyectar Token) ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- NUEVO: INTERCEPTOR DE RESPUESTA (Manejar expiración) ---
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa (200, 201), no hace nada
  (error) => {
    // Si el error es 401 (No autorizado) o 403 (Prohibido/Token inválido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Sesión expirada o inválida. Redirigiendo al login...");
      
      // Limpiamos los datos viejos para que ProtectedRoute detecte que ya no hay sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirección forzosa al login
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// --- SERVICIOS DE API ---
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const productosAPI = {
  getAll: () => api.get('/productos'),
  getById: (id) => api.get(`/productos/${id}`),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  delete: (id) => api.delete(`/productos/${id}`),
};

export const movimientosAPI = {
  getAll: () => api.get('/movimientos'),
  create: (data) => api.post('/movimientos', data),
};

export const categoriasAPI = {
  getAll: () => api.get('/categorias'),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.put(`/categorias/${id}`, data),
  delete: (id) => api.delete(`/categorias/${id}`),
};

export const proveedoresAPI = {
  getAll: () => api.get('/proveedores'),
  create: (data) => api.post('/proveedores', data),
  update: (id, data) => api.put(`/proveedores/${id}`, data),
  delete: (id) => api.delete(`/proveedores/${id}`),
};

export const marcasAPI = {
  getAll: () => api.get('/marcas'),
  create: (data) => api.post('/marcas', data),
  update: (id, data) => api.put(`/marcas/${id}`, data),
  delete: (id) => api.delete(`/marcas/${id}`),
};

export const informesAPI = {
  getResumen: () => api.get('/informes/resumen'),
};

export default api;