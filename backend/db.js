// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'QuanLyBenhVien',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

console.log('MySQL connect config:', {
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port,
});

const pool = mysql.createPool(config);

pool.getConnection()
  .then(() => console.log('✅ Connected to MySQL'))
  .catch(err => console.error('❌ MySQL Connection Failed!', err.message));

module.exports = pool;