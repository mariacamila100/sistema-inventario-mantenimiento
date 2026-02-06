const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middlewares ---

// Configuración de CORS optimizada
app.use(cors({
  // Permitimos tanto localhost como tu dominio de Railway
  origin: [
    'http://localhost:5173', // Puerto por defecto de Vite
    'https://vibrant-perception-production.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Útil si en el futuro usas cookies
}));

app.use(express.json());

// --- Rutas ---
// Nota: Asegúrate de que los archivos existan en la carpeta ./routes/
app.use('/api/productos', require('./routes/productos'));
app.use('/api/movimientos', require('./routes/movimientos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/marcas', require('./routes/marcas'));
app.use('/api/informes', require('./routes/informes'));

// Ruta de prueba inicial
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'API Inventario Mantenimiento funcionando correctamente' 
  });
});

// --- Lanzamiento ---
const PORT = process.env.PORT || 3000;

// Manejo de errores global (opcional pero recomendado)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en línea en el puerto ${PORT}`);
  // Mostramos la URL de Railway si existe, si no, la local
  const url = process.env.RAILWAY_STATIC_URL 
    ? `https://${process.env.RAILWAY_STATIC_URL}` 
    : `http://localhost:${PORT}`;
  console.log(`🔗 API Lista en: ${url}`);
});