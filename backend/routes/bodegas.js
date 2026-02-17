// backend/routes/bodegas.js
const express = require('express');
const router = express.Router();
const bodegasController = require('../controllers/bodegasController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, bodegasController.getBodegas);
router.put('/:id', auth, bodegasController.updateBodega);

// COMENTA ESTAS LÍNEAS SI NO ESTÁN EN EL CONTROLADOR:
// router.post('/', auth, bodegasController.createBodega);
// router.delete('/:id', auth, bodegasController.deleteBodega);

module.exports = router;