// backend/test-connect.js
const { sql } = require('mssql');
const config = require('./db'); // db.js sẽ log config và throw lỗi nếu ko connect

(async () => {
  try {
    const { poolPromise } = require('./db');
    const pool = await poolPromise;
    const res = await pool.request().query('SELECT 1 AS OK');
    console.log('DB test query result:', res.recordset);
    process.exit(0);
  } catch (err) {
    console.error('Test connect failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
