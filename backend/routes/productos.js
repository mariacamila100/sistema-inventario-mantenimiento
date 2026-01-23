const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, productosController.getProductos);
router.get('/:id', auth, productosController.getProductoById);
router.post('/', auth, productosController.createProducto);
router.put('/:id', auth, productosController.updateProducto);
router.delete('/:id', auth, productosController.deleteProducto);

module.exports = router;