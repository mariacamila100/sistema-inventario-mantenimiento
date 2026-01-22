const db = require('../config/database');

// Obtener movimientos
exports.getMovimientos = (req, res) => {
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
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Registrar movimiento (entrada o salida)
exports.createMovimiento = (req, res) => {
  const { producto_id, tipo, cantidad, motivo, usuario, observaciones } = req.body;
  
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Insertar movimiento
    const insertQuery = `
      INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, usuario, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [producto_id, tipo, cantidad, motivo, usuario, observaciones], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }
      
      // Actualizar stock del producto
      const stockChange = tipo === 'entrada' ? cantidad : -cantidad;
      const updateQuery = 'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?';
      
      db.query(updateQuery, [stockChange, producto_id], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }
        
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }
          res.status(201).json({ message: 'Movimiento registrado', id: result.insertId });
        });
      });
    });
  });
};