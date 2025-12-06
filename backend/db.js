// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'QuanLyBenhVien',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable SSL for Railway MySQL connections
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Connection timeout
  connectTimeout: 10000,
  // Enable keep-alive
  enableKeepAlive: true,
};

console.log('MySQL connect config:', {
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port,
  ssl: config.ssl ? 'enabled' : 'disabled',
});

const pool = mysql.createPool(config);

// Test connection on startup
pool.getConnection()
  .then((connection) => {
    console.log('✅ Connected to MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed!', err.message);
    console.error('Error details:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
    });
  });

module.exports = pool;