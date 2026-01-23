const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, categoriasController.getCategorias);

module.exports = router;