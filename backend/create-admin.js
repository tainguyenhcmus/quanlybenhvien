// create-admin.js
// Utility script to create or update admin account password
// Usage: node create-admin.js <username> <password> [MaChucVu]
// Example: node create-admin.js admin admin123 1

const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

async function createOrUpdateAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];
  const maChucVu = parseInt(process.argv[4]) || 1; // Default to admin (1)

  if (!username || !password) {
    console.error('❌ Usage: node create-admin.js <username> <password> [MaChucVu]');
    console.error('   Example: node create-admin.js admin admin123 1');
    console.error('   MaChucVu: 1=Admin, 2=Bác sĩ, 4=Bệnh nhân');
    process.exit(1);
  }

  try {
    // Hash the password
    console.log('🔐 Hashing password...');
    const hash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed successfully');

    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT MaTaiKhoan, TenDangNhap, MaChucVu FROM TaiKhoan WHERE TenDangNhap = ? LIMIT 1',
      [username]
    );

    if (existing.length > 0) {
      // Update existing account
      const user = existing[0];
      console.log(`\n📝 Updating existing account: ${username}`);
      console.log(`   Current MaChucVu: ${user.MaChucVu}`);
      
      await pool.execute(
        'UPDATE TaiKhoan SET MatKhauHash = ?, MaChucVu = ? WHERE TenDangNhap = ?',
        [hash, maChucVu, username]
      );
      
      console.log(`✅ Account updated successfully!`);
      console.log(`   Username: ${username}`);
      console.log(`   MaChucVu: ${maChucVu} (${maChucVu === 1 ? 'Admin' : maChucVu === 2 ? 'Bác sĩ' : 'Bệnh nhân'})`);
      console.log(`   Password: ${password}`);
    } else {
      // Create new account
      console.log(`\n➕ Creating new account: ${username}`);
      
      const [result] = await pool.execute(
        'INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen) VALUES (?, ?, ?, ?)',
        [username, hash, maChucVu, username]
      );
      
      console.log(`✅ Account created successfully!`);
      console.log(`   MaTaiKhoan: ${result.insertId}`);
      console.log(`   Username: ${username}`);
      console.log(`   MaChucVu: ${maChucVu} (${maChucVu === 1 ? 'Admin' : maChucVu === 2 ? 'Bác sĩ' : 'Bệnh nhân'})`);
      console.log(`   Password: ${password}`);
    }

    console.log('\n🎉 Done! You can now login with these credentials.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

createOrUpdateAdmin();

