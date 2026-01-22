const db = require('../config/database');

exports.getCategorias = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};