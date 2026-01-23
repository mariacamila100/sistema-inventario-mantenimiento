const db = require('../config/database');

// Obtener todas las categorías
exports.getCategorias = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM categorias ORDER BY nombre');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear una categoría
exports.createCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion]
        );
        res.status(201).json({ id: result.insertId, nombre, descripcion });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar una categoría
exports.updateCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        await db.query(
            'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion, id]
        );
        res.json({ message: 'Categoría actualizada con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar una categoría
exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        res.json({ message: 'Categoría eliminada con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};