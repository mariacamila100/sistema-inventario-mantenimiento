const db = require('../config/database');

// Obtener movimientos
exports.getMovimientos = async (req, res) => {
  const query = `
    SELECT 
      m.*,
      p.nombre as producto,
      p.codigo
    FROM movimientos m
    JOIN productos p ON m.producto_id = p.id
    ORDER BY m.fecha DESC
    LIMIT 100
  `;
  
  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Registrar movimiento (entrada o salida) con Transacción
exports.createMovimiento = async (req, res) => {
  const { producto_id, tipo, cantidad, motivo, usuario, observaciones } = req.body;
  
  // Obtenemos una conexión específica para la transacción
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Insertar movimiento
    const insertQuery = `
      INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, usuario, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(insertQuery, [producto_id, tipo, cantidad, motivo, usuario, observaciones]);
    
    // 2. Calcular cambio de stock
    const stockChange = tipo === 'entrada' ? cantidad : -cantidad;
    const updateQuery = 'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?';
    
    await connection.query(updateQuery, [stockChange, producto_id]);

    // 3. Confirmar cambios
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Movimiento registrado correctamente', 
      id: result.insertId 
    });

  } catch (err) {
    // Si algo sale mal, deshacemos todo
    await connection.rollback();
    console.error('Error en transacción:', err);
    res.status(500).json({ error: 'Error al registrar el movimiento: ' + err.message });
  } finally {
    // Muy importante: liberar la conexión siempre
    connection.release();
  }
};