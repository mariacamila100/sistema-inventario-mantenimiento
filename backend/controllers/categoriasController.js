const db = require('../config/database');

// Obtener solo categorías activas
exports.getCategorias = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM categorias WHERE estado = 'activo' ORDER BY nombre");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear una categoría (con estado activo por defecto)
exports.createCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, descripcion, estado) VALUES (?, ?, "activo")',
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

// DESACTIVAR categoría (Soft Delete)
exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        // Cambiamos DELETE por UPDATE de estado
        await db.query("UPDATE categorias SET estado = 'inactivo' WHERE id = ?", [id]);
        res.json({ message: 'Categoría desactivada con éxito' });
    } catch (err) {
        // Error común: la categoría está siendo usada por productos (si tienes llaves foráneas)
        res.status(500).json({ error: "No se puede desactivar: hay productos vinculados a esta categoría" });
    }
};