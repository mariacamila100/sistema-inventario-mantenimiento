// backend/routes/categorias.js
const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const auth = require('../middleware/authMiddleware');

// Obtener todas (Esta ya funciona)
router.get('/', auth, categoriasController.getCategorias);

// Crear nueva (Esta es la que te daba el error 404)
router.post('/', auth, categoriasController.createCategoria);

// Actualizar
router.put('/:id', auth, categoriasController.updateCategoria);

// Eliminar
router.delete('/:id', auth, categoriasController.deleteCategoria);

module.exports = router;