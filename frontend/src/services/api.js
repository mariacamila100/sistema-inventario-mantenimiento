import axios from 'axios';

// La URL que te dio Railway para el BACKEND (asegúrate de que sea la del backend)
const RAILWAY_API_URL = 'https://sistema-inventario-mantenimiento-production.up.railway.app'; 

const api = axios.create({
  // Agregamos /api al final para que coincida con tus rutas de Node.js
  baseURL: `${RAILWAY_API_URL}/api`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

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
};

export const proveedoresAPI = {
  getAll: () => api.get('/proveedores'),
};

export default api;