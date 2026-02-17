const db = require('../config/database');

const normalizarPrecio = (valor) => {
    if (valor === null || valor === undefined || valor === '') return 0;
    if (typeof valor === 'number') return valor;
    
    let str = String(valor).trim();
    if (str.includes(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
    } 
    else if ((str.match(/\./g) || []).length > 1) {
        str = str.replace(/\./g, '');
    }
    const resultado = parseFloat(str) || 0;
    return resultado;
};

// Obtener todos los productos
exports.getProductos = async (req, res) => {
    const query = `
        SELECT 
            p.*,
            b.nombre as bodega, -- Cambiado de categoria a bodega
            pr.nombre as proveedor,
            m.nombre as marca,
            (p.stock_actual * p.precio_unitario) as valor_total,
            CASE 
                WHEN p.stock_actual <= p.stock_minimo THEN 'BAJO STOCK'
                ELSE 'OK'
            END as alerta_stock
        FROM productos p
        LEFT JOIN bodegas b ON p.bodega_id = b.id -- Join con bodegas
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
        LEFT JOIN marcas m ON p.marca_id = m.id
        WHERE p.estado = 'activo'
        ORDER BY p.nombre
    `;
    
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
    const query = 'SELECT * FROM productos WHERE id = ?';
    try {
        const [results] = await db.query(query, [req.params.id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear nuevo producto
exports.createProducto = async (req, res) => {
    const { 
        codigo, nombre, descripcion, bodega_id, // Cambiado de categoria_id
        proveedor_id, marca_id, stock_actual, 
        stock_minimo, precio_unitario, ubicacion 
    } = req.body;

    const precioFinal = normalizarPrecio(precio_unitario);
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        const userId = req.user?.id || 1; 
        await connection.query('SET @usuario_id = ?', [userId]);

        const queryInsert = `
            INSERT INTO productos (
                codigo, nombre, descripcion, bodega_id, 
                proveedor_id, marca_id, stock_actual, 
                stock_minimo, precio_unitario, ubicacion
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await connection.query(queryInsert, [
            codigo, nombre, descripcion, bodega_id, // Usando bodega_id
            proveedor_id, marca_id, stock_actual || 0, 
            stock_minimo, precioFinal, ubicacion
        ]);

        await connection.commit();
        res.status(201).json({ message: 'Producto creado con éxito', id: result.insertId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// Actualizar producto
exports.updateProducto = async (req, res) => {
    const { 
        nombre, descripcion, bodega_id, // Cambiado de categoria_id
        proveedor_id, marca_id, stock_minimo, 
        precio_unitario, ubicacion 
    } = req.body;

    const precioFinal = normalizarPrecio(precio_unitario);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        const userId = req.user?.id || 1; 
        await connection.query('SET @usuario_id = ?', [userId]);

        const queryUpdate = `
            UPDATE productos 
            SET nombre = ?, descripcion = ?, bodega_id = ?, 
                proveedor_id = ?, marca_id = ?, stock_minimo = ?, 
                precio_unitario = ?, ubicacion = ?
            WHERE id = ?
        `;
        
        const [result] = await connection.query(queryUpdate, [
            nombre, descripcion, bodega_id, // Usando bodega_id
            proveedor_id, marca_id, stock_minimo, 
            precioFinal, ubicacion, req.params.id
        ]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await connection.commit();
        res.json({ message: 'Producto actualizado con éxito' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// Eliminar producto (Soft Delete)
exports.deleteProducto = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.user?.id || 1; 
        await connection.query('SET @usuario_id = ?', [userId]);

        const queryDelete = 'UPDATE productos SET estado = "inactivo" WHERE id = ?';
        const [result] = await connection.query(queryDelete, [req.params.id]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await connection.commit();
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};