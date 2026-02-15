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
    // Ya no extraemos 'observaciones' porque se eliminó de la tabla
    const { 
        producto_id, tipo, cantidad, motivo, 
        numero_documento, proveedor_id, precio_historico 
    } = req.body;
    
    const usuarioId = req.user?.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        
        // Seteamos el ID de usuario para posibles triggers de auditoría
        await connection.query('SET @usuario_id = ?', [usuarioId]);

        // 1. Obtener datos actuales del producto
        const [prodResult] = await connection.query(
            'SELECT stock_actual, precio_unitario FROM productos WHERE id = ?', [producto_id]
        );
        if (prodResult.length === 0) throw new Error('El producto no existe');

        // Definimos el precio: usamos el enviado o el que ya tiene el producto
        const valorAGuardar = precio_historico || prodResult[0].precio_unitario;

        // 2. Insertar Movimiento (Sin la columna observaciones)
        // Corregido: Se eliminó la doble coma y la referencia a observaciones
        const insertQuery = `
            INSERT INTO movimientos 
            (producto_id, tipo, cantidad, precio_historico, motivo, usuario_id, numero_documento, proveedor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.query(insertQuery, [
            producto_id, 
            tipo, 
            cantidad, 
            valorAGuardar, 
            motivo, 
            usuarioId, 
            numero_documento || null, 
            proveedor_id || null
        ]);

        // 3. Actualización de Stock Y PRECIO Maestro
        if (tipo === 'entrada') {
            // ENTRADA: Suma stock y ACTUALIZA el precio unitario del catálogo
            await connection.query(
                'UPDATE productos SET stock_actual = stock_actual + ?, precio_unitario = ? WHERE id = ?',
                [cantidad, valorAGuardar, producto_id]
            );
        } else {
            // SALIDA: Solo resta stock, el precio del catálogo no cambia
            await connection.query(
                'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
                [cantidad, producto_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Movimiento registrado y catálogo actualizado' });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
};