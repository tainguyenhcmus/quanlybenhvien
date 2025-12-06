// hash-password.js
// Utility script to generate bcrypt hash for a password
// Usage: node hash-password.js <password>
// Example: node hash-password.js mypassword123

const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = process.argv[2];

  if (!password) {
    console.error('❌ Usage: node hash-password.js <password>');
    console.error('   Example: node hash-password.js mypassword123');
    process.exit(1);
  }

  try {
    console.log('🔐 Hashing password...');
    const hash = await bcrypt.hash(password, 10);
    
    console.log('\n✅ Password hash generated:');
    console.log(hash);
    console.log('\n📋 SQL to update password in database:');
    console.log(`UPDATE TaiKhoan SET MatKhauHash = '${hash}' WHERE TenDangNhap = 'your_username';`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

hashPassword();

