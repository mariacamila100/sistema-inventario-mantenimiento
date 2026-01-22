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
// --- Lanzamiento ---
const PORT = process.env.PORT || 3000;

// En Railway NO usamos '0.0.0.0', dejamos que el servidor escuche por defecto
app.listen(PORT, () => {
  console.log(`🚀 Servidor en línea en el puerto ${PORT}`);
  console.log(`🔗 API Lista en: ${process.env.RAILWAY_STATIC_URL || 'http://localhost:' + PORT}`);
});