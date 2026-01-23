const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extraer el token de "Bearer TOKEN"

  if (!token) return res.status(403).json({ message: 'Acceso denegado. No hay token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_provisional');
    req.user = decoded; // Guardamos los datos del usuario en la petición
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};