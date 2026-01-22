const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  // Esta línea es la clave: intenta con guion bajo y sin guion bajo
  database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'railway',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// Mensaje de diagnóstico en los logs de Railway
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ ERROR CRÍTICO DE CONEXIÓN A BD:', err.message);
  } else {
    console.log('✅ Conexión exitosa a la base de datos MySQL');
    connection.release();
  }
});

module.exports = pool.promise();