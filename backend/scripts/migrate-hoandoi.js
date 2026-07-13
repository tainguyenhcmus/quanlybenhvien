require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const sqlPath = path.join(__dirname, '../../migration_hoandoi.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');
const statements = sql
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith('--') && !s.toUpperCase().startsWith('USE'));

(async () => {
  try {
    for (const stmt of statements) {
      if (stmt) await pool.execute(stmt);
    }
    const [rows] = await pool.execute("SHOW TABLES LIKE 'YeuCauHoanDoiCa'");
    console.log(rows.length ? '✅ Bảng YeuCauHoanDoiCa đã sẵn sàng' : '❌ Tạo bảng thất bại');
    process.exit(rows.length ? 0 : 1);
  } catch (err) {
    console.error('❌ Migration thất bại:', err.message);
    process.exit(1);
  }
})();
