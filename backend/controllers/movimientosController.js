// movimientosController.js
const db = require('../config/database');

exports.createMovimiento = async (req, res) => {
  const { producto_id, tipo, cantidad, motivo, observaciones } = req.body;

  // IMPORTANTE: Asegúrate que tu middleware de auth asigne el ID aquí
  const usuarioId = req.user?.id; 

  if (!usuarioId) {
    return res.status(401).json({ error: 'Sesión expirada o inválida' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Validar producto y stock
    const [prodResult] = await connection.query(
      'SELECT stock_actual FROM productos WHERE id = ?',
      [producto_id]
    );

    if (prodResult.length === 0) {
      throw new Error('El producto no existe');
    }

    if (tipo === 'salida' && prodResult[0].stock_actual < cantidad) {
      throw new Error('Stock insuficiente');
    }

    // 2. LA CORRECCIÓN CLAVE: Usar 'usuario_id' como nombre de columna
    const insertQuery = `
      INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, usuario_id, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(insertQuery, [
      producto_id,
      tipo,
      cantidad,
      motivo,
      usuarioId, // Este es el ID numérico del usuario
      observaciones || null
    ]);

    // 3. Actualizar Stock
    const stockChange = tipo === 'entrada' ? cantidad : -cantidad;
    await connection.query(
      'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?',
      [stockChange, producto_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Movimiento registrado', id: result.insertId });

  } catch (err) {
    await connection.rollback();
    console.error("Error en SQL:", err.message);
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
};