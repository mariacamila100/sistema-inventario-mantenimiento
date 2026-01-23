const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, movimientosController.getMovimientos);
router.post('/', auth, movimientosController.createMovimiento);
router.put('/:id', auth, movimientosController.updateMovimiento);
router.delete('/:id', auth, movimientosController.deleteMovimiento);


module.exports = router;