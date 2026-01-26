// backend/controllers/informesController.js
const db = require('../config/database');

exports.getResumenInventario = async (req, res) => {
    try {
        // 1. Resumen General
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

        // 3. Actividad (Refinado para evitar errores de agrupamiento)
        const [movimientosMes] = await db.query(`
            SELECT 
                DATE_FORMAT(fecha, '%b') as mes,
                COUNT(CASE WHEN tipo = 'entrada' THEN 1 END) as entradas,
                COUNT(CASE WHEN tipo = 'salida' THEN 1 END) as salidas
            FROM movimientos
            GROUP BY mes, MONTH(fecha)
            ORDER BY MONTH(fecha) ASC
            LIMIT 6
        `);

        res.json({
            resumen: stats[0] || { total_productos: 0, stock_total: 0, valor_inventario: 0 },
            stockCritico: criticos || [],
            grafica: movimientosMes || []
        });
    } catch (err) {
        console.error("❌ Error en Informes:", err.message);
        res.status(500).json({ error: "Error interno del servidor al generar informe" });
    }
};