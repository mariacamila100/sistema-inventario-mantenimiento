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
        numero_documento, proveedor_id, precio_historico 
    } = req.body;
    
    const usuarioId = req.user?.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        
        // Seteamos el ID para los triggers de auditoría (ya sin el problema del DEFINER)
        await connection.query('SET @usuario_id = ?', [usuarioId]);

        // 1. Obtener datos actuales (Usamos FOR UPDATE para bloquear la fila y evitar errores de cálculo si otro proceso intenta escribir)
        const [prodResult] = await connection.query(
            'SELECT stock_actual, precio_unitario FROM productos WHERE id = ? FOR UPDATE', [producto_id]
        );
        if (prodResult.length === 0) throw new Error('El producto no existe');

        const stockActual = Number(prodResult[0].stock_actual);
        const precioActual = Number(prodResult[0].precio_unitario);
        
        // Normalizamos el precio que llega (puedes usar tu función normalizarPrecio aquí)
        const valorNuevoMovimiento = Number(precio_historico) || precioActual;

        // 2. Insertar Movimiento en el Kárdex
        const insertQuery = `
            INSERT INTO movimientos 
            (producto_id, tipo, cantidad, precio_historico, motivo, usuario_id, numero_documento, proveedor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.query(insertQuery, [
            producto_id, tipo, cantidad, valorNuevoMovimiento, motivo, 
            usuarioId, numero_documento || null, proveedor_id || null
        ]);

        // 3. Lógica de Actualización de Stock y Precio Maestro
        if (tipo === 'entrada') {
            // --- CÁLCULO DE PROMEDIO PONDERADO ---
            // Fórmula: ((Stock Viejo * Precio Viejo) + (Stock Nuevo * Precio Nuevo)) / Stock Total
            const inversionActual = stockActual * precioActual;
            const inversionNueva = cantidad * valorNuevoMovimiento;
            const nuevoStockTotal = stockActual + cantidad;
            
            let nuevoPrecioPromedio;
            if (stockActual <= 0) {
                // Si no había stock, el nuevo precio es simplemente el de la compra actual
                nuevoPrecioPromedio = valorNuevoMovimiento;
            } else {
                nuevoPrecioPromedio = (inversionActual + inversionNueva) / nuevoStockTotal;
            }

            await connection.query(
                'UPDATE productos SET stock_actual = ?, precio_unitario = ? WHERE id = ?',
                [nuevoStockTotal, nuevoPrecioPromedio, producto_id]
            );
        } else {
            // SALIDA: Solo resta stock. El precio unitario (promedio) NO cambia cuando vendes.
            if (stockActual < cantidad) throw new Error('Stock insuficiente para esta salida');
            
            await connection.query(
                'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
                [cantidad, producto_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Movimiento registrado y precio promedio actualizado' });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
};