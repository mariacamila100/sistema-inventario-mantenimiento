const db = require('../config/database');

// Obtener todos los productos
exports.getProductos = async (req, res) => {
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
  
  try {
    const [results] = await db.query(query); // En promesas se usa destructuring [results]
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  const query = 'SELECT * FROM productos WHERE id = ?';
  try {
    const [results] = await db.query(query, [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nuevo producto
exports.createProducto = async (req, res) => {
  const { codigo, nombre, descripcion, categoria_id, proveedor_id, stock_actual, stock_minimo, precio_unitario, ubicacion } = req.body;
  const query = `
    INSERT INTO productos (codigo, nombre, descripcion, categoria_id, proveedor_id, stock_actual, stock_minimo, precio_unitario, ubicacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  try {
    const [result] = await db.query(query, [codigo, nombre, descripcion, categoria_id, proveedor_id, stock_actual, stock_minimo, precio_unitario, ubicacion]);
    res.status(201).json({ message: 'Producto creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar producto
exports.updateProducto = async (req, res) => {
  const { nombre, descripcion, categoria_id, proveedor_id, stock_minimo, precio_unitario, ubicacion } = req.body;
  const query = `
    UPDATE productos 
    SET nombre = ?, descripcion = ?, categoria_id = ?, proveedor_id = ?, stock_minimo = ?, precio_unitario = ?, ubicacion = ?
    WHERE id = ?
  `;
  
  try {
    await db.query(query, [nombre, descripcion, categoria_id, proveedor_id, stock_minimo, precio_unitario, ubicacion, req.params.id]);
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar producto (soft delete)
exports.deleteProducto = async (req, res) => {
  const query = 'UPDATE productos SET estado = "inactivo" WHERE id = ?';
  try {
    await db.query(query, [req.params.id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};