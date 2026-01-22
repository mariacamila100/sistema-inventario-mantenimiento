const db = require('../config/database');

// Obtener todos los productos
exports.getProductos = (req, res) => {
  const query = `
    SELECT 
      p.*,
      c.nombre as categoria,
      pr.nombre as proveedor,
      CASE 
        WHEN p.stock_actual <= p.stock_minimo THEN 'BAJO STOCK'
        ELSE 'OK'
      END as alerta_stock
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
    WHERE p.estado = 'activo'
    ORDER BY p.nombre
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Obtener un producto por ID
exports.getProductoById = (req, res) => {
  const query = 'SELECT * FROM productos WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(results[0]);
  });
};

// Crear nuevo producto
exports.createProducto = (req, res) => {
  const { codigo, nombre, descripcion, categoria_id, proveedor_id, stock_actual, stock_minimo, precio_unitario, ubicacion } = req.body;
  
  const query = `
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, proveedor_id, stock_actual, stock_minimo, precio_unitario, ubicacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [codigo, nombre, descripcion, categoria_id, proveedor_id, stock_actual, stock_minimo, precio_unitario, ubicacion], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Producto creado', id: result.insertId });
  });
};

// Actualizar producto
exports.updateProducto = (req, res) => {
  const { nombre, descripcion, categoria_id, proveedor_id, stock_minimo, precio_unitario, ubicacion } = req.body;
  
  const query = `
    UPDATE productos 
    SET nombre = ?, descripcion = ?, categoria_id = ?, proveedor_id = ?, stock_minimo = ?, precio_unitario = ?, ubicacion = ?
    WHERE id = ?
  `;
  
  db.query(query, [nombre, descripcion, categoria_id, proveedor_id, stock_minimo, precio_unitario, ubicacion, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Producto actualizado' });
  });
};

// Eliminar producto (soft delete)
exports.deleteProducto = (req, res) => {
  const query = 'UPDATE productos SET estado = "inactivo" WHERE id = ?';
  
  db.query(query, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Producto eliminado' });
  });
};