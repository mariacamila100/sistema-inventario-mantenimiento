const express = require('express');
const router = express.Router();
const informesController = require('../controllers/informesController');
const authMiddleware = require('../middleware/authMiddleware'); // O como se llame tu middleware de protección

// Todas las rutas de informes deben estar protegidas
router.get('/resumen', authMiddleware, informesController.getResumenInventario);

module.exports = router;