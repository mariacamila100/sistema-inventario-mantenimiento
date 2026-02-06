const express = require('express');
const router = express.Router();
const informesController = require('../controllers/informesController');

// Asegúrate de que los nombres después del punto sean EXACTOS
router.get('/resumen', informesController.getResumenInventario);
router.get('/inventario-completo', informesController.getInventarioCompleto);
router.get('/stock-critico', informesController.getStockMinimo);
router.get('/proveedores', informesController.getProveedoresResumen);

module.exports = router;