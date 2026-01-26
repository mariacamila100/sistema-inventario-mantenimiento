import axios from 'axios';

const RAILWAY_API_URL = 'https://sistema-inventario-mantenimiento-production.up.railway.app'; 

const api = axios.create({
  baseURL: `${RAILWAY_API_URL}/api`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR PARA INYECTAR EL TOKEN ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

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

// NUEVO SERVICIO:
export const informesAPI = {
  getResumen: () => api.get('/informes/resumen'),
};


export default api;