const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  // Ajustado para coincidir con tus variables de Railway (image_2249f2.png)
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE, // Con guion bajo como en tu captura
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool.promise();