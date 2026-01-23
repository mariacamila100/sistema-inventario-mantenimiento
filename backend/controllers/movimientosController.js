// backend/controllers/movimientosController.js
const db = require('../config/database');

// 1. OBTENER MOVIMIENTOS (Con nombres de producto y usuario)
exports.getMovimientos = async (req, res) => {
    try {
        const query = `
            SELECT m.*, p.nombre as producto_nombre, u.username 
            FROM movimientos m
            JOIN productos p ON m.producto_id = p.id
            JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.fecha DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. CREAR MOVIMIENTO (Con lógica de stock y transacción)
exports.createMovimiento = async (req, res) => {
    const { producto_id, tipo, cantidad, motivo, observaciones } = req.body;
    const usuarioId = req.user?.id; 

    if (!usuarioId) {
        return res.status(401).json({ error: 'Sesión expirada o inválida' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Validar producto y stock
        const [prodResult] = await connection.query(
            'SELECT stock_actual FROM productos WHERE id = ?',
            [producto_id]
        );

        if (prodResult.length === 0) throw new Error('El producto no existe');
        if (tipo === 'salida' && prodResult[0].stock_actual < cantidad) {
            throw new Error('Stock insuficiente');
        }

        // Insertar movimiento
        const insertQuery = `
            INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, usuario_id, observaciones)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(insertQuery, [
            producto_id, tipo, cantidad, motivo, usuarioId, observaciones || null
        ]);

        // Actualizar Stock en tabla productos
        const stockChange = tipo === 'entrada' ? cantidad : -cantidad;
        await connection.query(
            'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?',
            [stockChange, producto_id]
        );

        await connection.commit();
        res.status(201).json({ message: 'Movimiento registrado', id: result.insertId });

    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// 3. PLACEHOLDERS (Para que las rutas no fallen)
exports.updateMovimiento = async (req, res) => {
    res.status(501).json({ message: "No se permite editar movimientos por integridad de stock" });
};

exports.deleteMovimiento = async (req, res) => {
    res.status(501).json({ message: "No se permite eliminar movimientos por integridad de stock" });
};