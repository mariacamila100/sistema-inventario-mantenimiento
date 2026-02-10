const db = require('../config/database');

const informesController = {
    getInventarioCompleto: async (req, res) => {
        try {
            const query = `
                SELECT 
                    p.codigo AS 'CÓDIGO', 
                    p.nombre AS 'PRODUCTO', 
                    IFNULL(m.nombre, '—') AS 'MARCA', 
                    IFNULL(c.nombre, '—') AS 'CATEGORÍA', 
                    p.stock_actual AS 'STOCK', 
                    ROUND(p.precio_unitario, 0) AS 'PRECIO UNITARIO', 
                    ROUND((p.stock_actual * p.precio_unitario), 0) AS 'VALOR TOTAL'
                FROM productos p
                LEFT JOIN marcas m ON p.marca_id = m.id
                LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE p.estado = 'Activo'
                ORDER BY p.nombre ASC`;

            const [rows] = await db.query(query);
            const granTotal = rows.reduce((acc, item) => acc + parseFloat(item['VALOR TOTAL'] || 0), 0);

            res.json({ detalles: rows, sumatoriaTotal: granTotal });
        } catch (error) {
            console.error("Error en informe:", error);
            res.status(500).json({ error: 'Error al generar el informe' });
        }
    },

    getStockMinimo: async (req, res) => {
        try {
            const query = `
                SELECT nombre AS 'NOMBRE', stock_actual AS 'STOCK ACTUAL', 
                       stock_minimo AS 'STOCK MÍNIMO', 
                       (stock_minimo - stock_actual) as 'FALTANTE'
                FROM productos 
                WHERE stock_actual <= stock_minimo
                AND estado = 'Activo'
                ORDER BY (stock_minimo - stock_actual) DESC`;
            const [rows] = await db.query(query);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error al generar alertas' });
        }
    },

    getProveedoresResumen: async (req, res) => {
        try {
            const query = `
                SELECT nombre AS 'PROVEEDOR', contacto AS 'CONTACTO', 
                       telefono AS 'TELÉFONO', email AS 'EMAIL' 
                FROM proveedores ORDER BY nombre ASC`;
            const [rows] = await db.query(query);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener proveedores' });
        }
    },

    getResumenInventario: async (req, res) => {
        try {
            const [resumen] = await db.query('SELECT SUM(stock_actual * precio_unitario) as valor_inventario FROM productos WHERE estado = "Activo"');
            res.json({ resumen: resumen[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = informesController;