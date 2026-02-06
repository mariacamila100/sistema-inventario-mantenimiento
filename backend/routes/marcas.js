const express = require('express');
const router = express.Router();
const marcasController = require('../controllers/marcasController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas de marcas protegidas por token
router.use(authMiddleware);

router.get('/', marcasController.getAll);
router.post('/', marcasController.create);
router.put('/:id', marcasController.update);
router.delete('/:id', marcasController.delete);

module.exports = router;