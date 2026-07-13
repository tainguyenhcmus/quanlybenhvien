require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const sqlPath = path.join(__dirname, '../../migration_thongbao_lichsu.sql');
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
    const [tb] = await pool.execute("SHOW TABLES LIKE 'ThongBao'");
    const [ls] = await pool.execute("SHOW TABLES LIKE 'LichSuLichTruc'");
    console.log(tb.length && ls.length ? '✅ Bảng ThongBao & LichSuLichTruc đã sẵn sàng' : '❌ Tạo bảng thất bại');
    process.exit(tb.length && ls.length ? 0 : 1);
  } catch (err) {
    console.error('❌ Migration thất bại:', err.message);
    process.exit(1);
  }
})();
