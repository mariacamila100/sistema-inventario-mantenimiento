const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  // Railway te dará estas variables automáticamente
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool.promise();