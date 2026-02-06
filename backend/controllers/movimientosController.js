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
    // 1. Recibimos proveedor_id desde el body
    const { 
        producto_id, 
        tipo, 
        cantidad, 
        motivo, 
        observaciones, 
        numero_documento,
        proveedor_id // <-- Añadido
    } = req.body;
    
    const usuarioId = req.user?.id;

    if (!usuarioId) return res.status(401).json({ error: 'Sesión expirada' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // IMPORTANTE: Definir usuario para los Triggers de auditoría
        await connection.query('SET @usuario_id = ?', [usuarioId]);

        // 2. Validar existencia y stock
        const [prodResult] = await connection.query(
            'SELECT stock_actual FROM productos WHERE id = ?', [producto_id]
        );

        if (prodResult.length === 0) throw new Error('El producto no existe');
        
        const stockDisponible = prodResult[0].stock_actual;

        if (tipo === 'salida' && stockDisponible < cantidad) {
            throw new Error(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
        }

        // 3. Insertar movimiento (Incluyendo proveedor_id)
        const insertQuery = `
            INSERT INTO movimientos 
            (producto_id, tipo, cantidad, motivo, usuario_id, observaciones, numero_documento, proveedor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(insertQuery, [
            producto_id, 
            tipo, 
            cantidad, 
            motivo, 
            usuarioId, 
            observaciones || null, 
            numero_documento || null,
            proveedor_id || null // <-- Añadido
        ]);

        // 4. Actualizar stock del producto
        const stockChange = tipo === 'entrada' ? cantidad : -cantidad;
        await connection.query(
            'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?',
            [stockChange, producto_id]
        );

        await connection.commit();
        res.status(201).json({ 
            message: 'Movimiento registrado con éxito', 
            id: result.insertId 
        });

    } catch (err) {
        await connection.rollback();
        // Enviamos un mensaje más amigable al frontend
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
};