const express = require('express');
const cors = require('cors'); // Se declara una sola vez aquí arriba
require('dotenv').config();

const app = express();

// --- Middlewares ---

// Configuración de CORS para permitir conexiones de red local
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- Rutas ---
app.use('/api/productos', require('./routes/productos'));
app.use('/api/movimientos', require('./routes/movimientos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/proveedores', require('./routes/proveedores'));

// Ruta de prueba inicial
app.get('/', (req, res) => {
  res.json({ message: 'API Inventario Mantenimiento funcionando' });
});

// --- Lanzamiento ---
const PORT = process.env.PORT || 3000;

// Escuchar en 0.0.0.0 permite que otros equipos usen tu IP para entrar
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en red local en el puerto ${PORT}`);
  console.log(`📍 Intenta entrar desde otro equipo a: http://192.168.0.115:${PORT}/api/productos`);
});