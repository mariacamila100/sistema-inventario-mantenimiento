const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');
const auth = require('../middleware/authMiddleware');

// Obtener todos los proveedores
router.get('/', auth, proveedoresController.getProveedores);
// ESTAS SON LAS QUE FALTAN Y CAUSAN EL 404:
router.post('/', auth, proveedoresController.createProveedor);
router.put('/:id', auth, proveedoresController.updateProveedor);
router.delete('/:id', auth, proveedoresController.deleteProveedor);
module.exports = router;