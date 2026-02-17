const db = require('../config/database');

const informesController = {
    getInventarioCompleto: async (req, res) => {
    try {
        const { marca, categoria, mes } = req.query;
        let valores = [];
        
        let query = `
            SELECT 
                p.codigo AS 'CÓDIGO', 
                p.nombre AS 'PRODUCTO', 
                IFNULL(m.nombre, '—') AS 'MARCA', 
                IFNULL(c.nombre, '—') AS 'CATEGORÍA', 
                p.stock_actual AS 'STOCK', 
                p.precio_unitario AS 'PRECIO UNITARIO', 
                (p.stock_actual * p.precio_unitario) AS 'VALOR TOTAL'
            FROM productos p
            LEFT JOIN marcas m ON p.marca_id = m.id
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.estado = 'Activo'`;

        // Filtro por Marca
        if (marca && marca !== 'todas') {
            query += ` AND p.marca_id = ?`;
            valores.push(marca);
        }

        // Filtro por Categoría
        if (categoria && categoria !== 'todas') {
            query += ` AND p.categoria_id = ?`;
            valores.push(categoria);
        }

        // Filtro por Mes (basado en la fecha de creación del producto)
        if (mes && mes !== 'todos') {
            query += ` AND MONTH(p.created_at) = ?`;
            valores.push(mes);
        }

        query += ` ORDER BY p.nombre ASC`;

        const [rows] = await db.query(query, valores);
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

    getKardex: async (req, res) => {
        try {
            const { producto, tipo } = req.query;
            let valores = [];
            
            let query = `
                SELECT 
                    DATE_FORMAT(m.fecha, '%d/%m/%Y %H:%i') AS 'FECHA',
                    p.nombre AS 'PRODUCTO',
                    UPPER(m.tipo) AS 'OPERACIÓN',
                    m.cantidad AS 'CANT.',
                    m.precio_historico AS 'PRECIO HISTÓRICO', 
                    (m.cantidad * m.precio_historico) AS 'SUBTOTAL',
                    IFNULL(m.numero_documento, '—') AS 'DOCUMENTO',
                    IFNULL(u.username, 'Sistema') AS 'RESPONSABLE'
                FROM movimientos m
                INNER JOIN productos p ON m.producto_id = p.id
                LEFT JOIN usuarios u ON m.usuario_id = u.id
                WHERE 1=1`;

            if (producto) {
                query += ` AND p.nombre LIKE ?`;
                valores.push(`%${producto}%`);
            }

            if (tipo && tipo !== 'todos') {
                query += ` AND m.tipo = ?`;
                valores.push(tipo);
            }

            query += ` ORDER BY m.fecha DESC LIMIT 150`;

            const [rows] = await db.query(query, valores);
            res.json(rows);
        } catch (error) {
            console.error("Error en Kardex:", error);
            res.status(500).json({ error: 'Error al filtrar el historial' });
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