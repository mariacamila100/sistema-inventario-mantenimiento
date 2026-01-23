const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, proveedoresController.getProveedores);

module.exports = router;