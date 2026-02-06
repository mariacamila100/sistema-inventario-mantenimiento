const db = require('../config/database');

const marcasController = {
    getAll: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM marcas ORDER BY nombre ASC');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener marcas' });
        }
    },

    create: async (req, res) => {
        const { nombre, descripcion } = req.body;
        try {
            const [result] = await db.query(
                'INSERT INTO marcas (nombre, descripcion) VALUES (?, ?)',
                [nombre, descripcion]
            );
            res.json({ id: result.insertId, nombre, descripcion });
        } catch (error) {
            res.status(500).json({ error: 'Error al crear marca' });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        try {
            await db.query(
                'UPDATE marcas SET nombre = ?, descripcion = ? WHERE id = ?',
                [nombre, descripcion, id]
            );
            res.json({ message: 'Marca actualizada' });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar marca' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM marcas WHERE id = ?', [id]);
            res.json({ message: 'Marca eliminada' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar marca' });
        }
    }
};

module.exports = marcasController;