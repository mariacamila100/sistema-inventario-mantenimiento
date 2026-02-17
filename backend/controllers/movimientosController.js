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
        producto_id, tipo, cantidad, motivo, 
        numero_documento, proveedor_id, precio_historico // Este es el precio ya calculado que viene del Front
    } = req.body;
    
    const usuarioId = req.user?.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query('SET @usuario_id = ?', [usuarioId]);

        // 1. Obtener datos actuales (Usando el nombre real de tu columna: precio_unitario)
        const [prodResult] = await connection.query(
            'SELECT stock_actual, precio_unitario FROM productos WHERE id = ? FOR UPDATE', [producto_id]
        );
        
        if (prodResult.length === 0) throw new Error('El producto no existe');

        // 2. Insertar Movimiento (Usando VALUES corregido)
        const insertQuery = `
            INSERT INTO movimientos 
            (producto_id, tipo, cantidad, precio_historico, motivo, usuario_id, numero_documento, proveedor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.query(insertQuery, [
            producto_id, tipo, cantidad, precio_historico, motivo, 
            usuarioId, numero_documento || null, proveedor_id || null
        ]);

        // 3. Actualización de Stock
        const stockActual = Number(prodResult[0].stock_actual);
        if (tipo === 'entrada') {
            await connection.query(
                'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?',
                [Number(cantidad), producto_id]
            );
        } else {
            if (stockActual < cantidad) throw new Error('Stock insuficiente');
            await connection.query(
                'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
                [Number(cantidad), producto_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Registrado con éxito' });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
};