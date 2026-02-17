const db = require('../config/database');

exports.getBodegas = async (req, res) => {
    try {
        // Esta consulta cuenta cuántos productos únicos hay y la suma total de stock en cada bodega
        const query = `
            SELECT 
                b.*, 
                COUNT(p.id) as total_productos_unicos,
                IFNULL(SUM(p.stock_actual), 0) as stock_total_acumulado
            FROM bodegas b
            LEFT JOIN productos p ON b.id = p.bodega_id
            WHERE b.estado = 'activo'
            GROUP BY b.id
            ORDER BY b.id ASC
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateBodega = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        await db.query(
            'UPDATE bodegas SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion, id]
        );
        res.json({ message: 'Bodega actualizada con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};