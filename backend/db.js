// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Debug: Log environment variables (without sensitive data)
console.log('🔍 Environment variables check:');
console.log('DB_HOST:', process.env.DB_HOST ? '✅ Set' : '❌ Not set');
console.log('DB_USER:', process.env.DB_USER ? '✅ Set' : '❌ Not set');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('DB_DATABASE:', process.env.DB_DATABASE ? `✅ Set (${process.env.DB_DATABASE})` : '❌ Not set');
console.log('DB_PORT:', process.env.DB_PORT ? `✅ Set (${process.env.DB_PORT})` : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'QuanLyBenhVien', // Matches SQL file database name
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable SSL for Railway MySQL connections (Railway requires SSL)
  // Enable SSL if DB_HOST contains 'railway' or 'rlwy' or if explicitly set
  ssl: (process.env.DB_HOST && (process.env.DB_HOST.includes('railway') || process.env.DB_HOST.includes('rlwy'))) || process.env.DB_SSL === 'true' 
    ? { rejectUnauthorized: false } 
    : false,
  // Connection timeout
  connectTimeout: 10000,
  // Enable keep-alive
  enableKeepAlive: true,
};

console.log('📊 MySQL connect config:', {
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