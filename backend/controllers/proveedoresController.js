const db = require('../config/database');

// Obtener solo proveedores activos
exports.getProveedores = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM proveedores WHERE estado = 'activo' ORDER BY nombre");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un proveedor (asegurando estado activo)
exports.createProveedor = async (req, res) => {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO proveedores (nombre, contacto, telefono, email, direccion, estado) VALUES (?, ?, ?, ?, ?, "activo")',
            [nombre, contacto, telefono, email, direccion]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un proveedor
exports.updateProveedor = async (req, res) => {
    const { id } = req.params;
    const { nombre, contacto, telefono, email, direccion } = req.body;
    try {
        await db.query(
            'UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?',
            [nombre, contacto, telefono, email, direccion, id]
        );
        res.json({ message: 'Proveedor actualizado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DESACTIVAR proveedor (Soft Delete)
exports.deleteProveedor = async (req, res) => {
    const { id } = req.params;
    try {
        // En lugar de DELETE, hacemos UPDATE
        await db.query("UPDATE proveedores SET estado = 'inactivo' WHERE id = ?", [id]);
        res.json({ message: 'Proveedor desactivado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};