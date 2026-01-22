import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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