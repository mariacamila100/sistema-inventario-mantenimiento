const db = require('../config/database');

exports.getProveedores = (req, res) => {
  db.query('SELECT * FROM proveedores ORDER BY nombre', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};