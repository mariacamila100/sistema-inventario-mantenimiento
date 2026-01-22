import axios from 'axios';

// 1. Averigua la IP de tu PC Servidor con 'ipconfig' en la terminal
// 2. Cambia 'localhost' por esa IP (Ejemplo: 192.168.1.15)
const SERVER_IP = '192.168.0.115'; 

const api = axios.create({
  // Ahora cualquier equipo de tu red apuntará a la PC Servidor
  baseURL: `http://${SERVER_IP}:3000/api`, 
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