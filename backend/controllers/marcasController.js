const db = require('../config/database');

const marcasController = {
    getAll: async (req, res) => {
        try {
            // Solo filtramos las marcas activas
            const [rows] = await db.query('SELECT * FROM marcas WHERE estado = "activo" ORDER BY nombre ASC');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener marcas' });
        }
    },

    create: async (req, res) => {
        const { nombre, descripcion } = req.body;
        try {
            const [result] = await db.query(
                'INSERT INTO marcas (nombre, descripcion, estado) VALUES (?, ?, "activo")',
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
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Seteamos el usuario para el trigger de auditoría si lo tienes configurado
            const userId = req.user?.id || 1; 
            await connection.query('SET @usuario_id = ?', [userId]);

            // IMPORTANTE: Cambiamos DELETE por UPDATE
            await connection.query(
                'UPDATE marcas SET estado = "inactivo" WHERE id = ?', 
                [id]
            );

            await connection.commit();
            res.json({ message: 'Marca desactivada correctamente' });
        } catch (error) {
            await connection.rollback();
            res.status(500).json({ error: 'Error al desactivar la marca' });
        } finally {
            connection.release();
        }
    }
};

module.exports = marcasController;