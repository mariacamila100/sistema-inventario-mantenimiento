const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, nombre_completo, email, password, rol_id } = req.body;
    try {
        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const query = `INSERT INTO usuarios (username, nombre_completo, email, password_hash, rol_id) VALUES (?, ?, ?, ?, ?)`;
        await db.query(query, [username, nombre_completo, email, password_hash, rol_id || 2]);
        
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query(
            'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.username = ?', 
            [username]
        );
        
        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

        // --- SOLUCIÓN: Actualizar el campo ultimo_login ---
        // Usamos NOW() de MySQL para obtener la fecha/hora exacta del servidor
        await db.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [user.id]);

        // Crear Token (Usando solo la variable de entorno de Railway)
        const token = jwt.sign(
            { id: user.id, rol: user.rol_nombre },
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } //caducidad de 24 horas para mejorar la experiencia del usuario sin comprometer la seguridad
        );

        res.json({
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                rol: user.rol_nombre,
                nombre_completo: user.nombre_completo // Añadido para que el Navbar lo muestre
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};