// backend/controllers/movimientosController.js
const db = require('../config/database');

exports.getMovimientos = async (req, res) => {
    try {
        // Usamos LEFT JOIN para que se vean los movimientos con usuario_id NULL
        const query = `
            SELECT 
                m.*, 
                p.nombre as producto_nombre, 
                IFNULL(u.username, 'Sistema/Anónimo') as username 
            FROM movimientos m
            LEFT JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.fecha DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMovimiento = async (req, res) => {
  const { producto_id, tipo, cantidad, motivo, observaciones } = req.body;
  const usuarioId = req.user?.id; 

  if (!usuarioId) {
    return res.status(401).json({ error: 'Sesión expirada o inválida' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [prodResult] = await connection.query(
      'SELECT stock_actual FROM productos WHERE id = ?',
      [producto_id]
    );

    if (prodResult.length === 0) throw new Error('El producto no existe');
    if (tipo === 'salida' && prodResult[0].stock_actual < cantidad) {
      throw new Error('Stock insuficiente');
    }

    const insertQuery = `
      INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, usuario_id, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(insertQuery, [
      producto_id, tipo, cantidad, motivo, usuarioId, observaciones || null
    ]);

    const stockChange = tipo === 'entrada' ? cantidad : -cantidad;
    await connection.query(
      'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?',
      [stockChange, producto_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Movimiento registrado', id: result.insertId });

  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
};

exports.updateMovimiento = async (req, res) => {
    res.status(501).json({ message: "No se permite editar movimientos" });
};

exports.deleteMovimiento = async (req, res) => {
    res.status(501).json({ message: "No se permite eliminar movimientos" });
};