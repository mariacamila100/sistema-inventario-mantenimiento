const db = require('../config/database');

exports.getResumenInventario = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        // 1. Resumen General (Stock actual y valorización)
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total_productos,
                CAST(IFNULL(SUM(stock_actual), 0) AS UNSIGNED) as stock_total,
                CAST(IFNULL(SUM(stock_actual * precio_unitario), 0) AS DECIMAL(12,2)) as valor_inventario
            FROM productos
        `);

        // 2. Stock crítico
        const [criticos] = await db.query(`
            SELECT nombre, stock_actual, stock_minimo 
            FROM productos 
            WHERE stock_actual <= stock_minimo
            LIMIT 5
        `);
// Obtener historial detallado de un producto específico
exports.getHistorialProducto = async (req, res) => {
    try {
        const { productoId, fechaInicio, fechaFin } = req.query;
        
        let query = `
            SELECT 
                m.id,
                p.nombre as producto,
                m.tipo,
                m.cantidad,
                m.motivo,
                m.fecha,
                u.nombre as realizado_por
            FROM movimientos m
            JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            WHERE 1=1
        `;
        
        const params = [];

        if (productoId) {
            query += " AND m.producto_id = ?";
            params.push(productoId);
        }
        if (fechaInicio && fechaFin) {
            query += " AND m.fecha BETWEEN ? AND ?";
            params.push(fechaInicio, fechaFin);
        }

        query += " ORDER BY m.fecha DESC";

        const [movimientos] = await db.query(query, params);
        res.json(movimientos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
        // 3. Movimientos filtrados por fecha
        // Si no hay fechas, usamos el último mes
        const queryMovimientos = `
            SELECT 
                DATE_FORMAT(fecha, '%d/%m') as etiqueta,
                COUNT(CASE WHEN tipo = 'entrada' THEN 1 END) as entradas,
                COUNT(CASE WHEN tipo = 'salida' THEN 1 END) as salidas
            FROM movimientos
            WHERE fecha BETWEEN 
                IFNULL(?, DATE_SUB(NOW(), INTERVAL 30 DAY)) 
                AND IFNULL(?, NOW())
            GROUP BY etiqueta, fecha
            ORDER BY fecha ASC
        `;

        const [movimientos] = await db.query(queryMovimientos, [fechaInicio, fechaFin]);

        res.json({
            resumen: stats[0],
            stockCritico: criticos || [],
            grafica: movimientos || []
        });
    } catch (err) {
        console.error("Error en Informes:", err);
        res.status(500).json({ error: err.message });
    }
};