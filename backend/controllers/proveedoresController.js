const db = require('../config/database');

// Obtener todos los proveedores
exports.getProveedores = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM proveedores ORDER BY nombre');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear un proveedor
exports.createProveedor = async (req, res) => {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)',
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

// Eliminar un proveedor
exports.deleteProveedor = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM proveedores WHERE id = ?', [id]);
        res.json({ message: 'Proveedor eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};