const db = require('../config/database');

exports.getMovimientos = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.*, 
                p.nombre as producto_nombre, 
                IFNULL(u.username, 'Sistema/Anónimo') as username 
            FROM movimientos m
            LEFT JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.fecha DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createMovimiento = async (req, res) => {
    const { 
        producto_id, 
        tipo, 
        cantidad, 
        motivo, 
        observaciones, 
        numero_documento,
        proveedor_id,
        precio_historico // Cambiado para que coincida con lo que envía React
    } = req.body;
    
    const usuarioId = req.user?.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query('SET @usuario_id = ?', [usuarioId]);

        // 1. Obtener datos del producto
        const [prodResult] = await connection.query(
            'SELECT stock_actual, precio_unitario FROM productos WHERE id = ?', [producto_id]
        );

        if (prodResult.length === 0) throw new Error('El producto no existe');

        // 2. Lógica de precio: 
        // Si el usuario digitó un precio (el de venta), usamos ese.
        // Si no (ej. una entrada de stock normal), usamos el precio base del producto.
        const valorAGuardar = precio_historico || prodResult[0].precio_unitario;

        const insertQuery = `
            INSERT INTO movimientos 
            (producto_id, tipo, cantidad, precio_historico, motivo, usuario_id, observaciones, numero_documento, proveedor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.query(insertQuery, [
            producto_id, 
            tipo, 
            cantidad, 
            valorAGuardar, 
            motivo, 
            usuarioId, 
            observaciones || null, 
            numero_documento || null,
            proveedor_id || null
        ]);

        // 3. Actualización de Stock
        const stockChange = tipo === 'entrada' ? cantidad : -cantidad;
        await connection.query(
            'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?',
            [stockChange, producto_id]
        );

        await connection.commit();
        res.status(201).json({ message: 'Movimiento registrado con éxito' });

    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
};