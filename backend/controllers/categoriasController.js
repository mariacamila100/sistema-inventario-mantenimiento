const db = require('../config/database');

exports.getCategorias = (req, res) => {
  db.query('SELECT * FROM categorias ORDER BY nombre', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};