const db = require('../config/database');

exports.getProveedores = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM proveedores ORDER BY nombre');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};