// hash-update.js
// Usage: node hash-update.js users.json
// Output: SQL UPDATE statements printed to stdout
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // npm i bcryptjs

const file = process.argv[2] || 'users.json';
if (!fs.existsSync(file)) {
  console.error('File not found:', file);
  process.exit(1);
}
const users = JSON.parse(fs.readFileSync(file, 'utf8'));

(async () => {
  for (const u of users) {
    const plain = u.matKhau;
    const hash = await bcrypt.hash(plain, 10); // rounds = 10 (thay nếu backend dùng khác)
    // Escape single quotes for SQL string literal
    const safeHash = hash.replace(/'/g, "''");
    const userEsc = String(u.tenDangNhap).replace(/'/g, "''");
    console.log(`-- user: ${userEsc}`);
    console.log(`UPDATE TaiKhoan SET MatKhau = '${safeHash}' WHERE TenDangNhap = '${userEsc}';\n`);
  }
})();
