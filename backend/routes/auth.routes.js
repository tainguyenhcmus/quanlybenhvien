// backend/routes/auth.routes.js (sửa handler /dangnhap)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
require('dotenv').config();

function looksLikeBcryptHash(s) {
  return typeof s === 'string' && /^\$2[aby]\$/.test(s);
}

router.post('/dangnhap', async (req, res) => {
  const { tenDangNhap, matKhau } = req.body;
  if (!tenDangNhap || !matKhau) return res.status(400).json({ message: 'Thiếu thông tin đăng nhập' });

  try {
  // Using mysql2 pool (exported from ../db.js)
  // mysql uses ? placeholders and LIMIT for single-row selection
  console.log("🚀 ~ pool:", pool)
  const q = 'SELECT * FROM TaiKhoan WHERE TenDangNhap = ? LIMIT 1';
  const [rows] = await pool.execute(q, [tenDangNhap]);
  const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại' });

    // Determine which stored password to use
    const hashFromMatKhauHashCol = user.MatKhauHash; // preferred column
    const hashFromMatKhauCol = user.MatKhau; // legacy column (may be plain or hashed)

    // 1) If MatKhauHash exists -> use bcrypt.compare
    if (hashFromMatKhauHashCol) {
      // defensive: ensure it's a string and trim accidental whitespace/truncation artifacts
      const stored = String(hashFromMatKhauHashCol).trim();
      console.log('Using MatKhauHash column. stored length:', stored.length, 'prefix:', stored.slice(0, 8));
      try {
        const match = await bcrypt.compare(matKhau, stored);
        console.log('bcrypt.compare result:', match,matKhau, stored);
        if (!match) return res.status(401).json({ message: 'Mật khẩu sai' });
      } catch (e) {
        console.error('bcrypt.compare error:', e);
        return res.status(500).json({ message: 'Lỗi bcrypt', error: e.message });
      }
    } 
    // 2) If MatKhau exists and looks like bcrypt hash -> treat as hash
    else if (hashFromMatKhauCol && looksLikeBcryptHash(hashFromMatKhauCol)) {
      const stored = String(hashFromMatKhauCol).trim();
      console.log('Using MatKhau column (bcrypt-like). stored length:', stored.length, 'prefix:', stored.slice(0,8));
      try {
        const match = await bcrypt.compare(matKhau, stored);
        console.log('bcrypt.compare result (legacy column):', match);
        if (!match) return res.status(401).json({ message: 'Mật khẩu sai' });
      } catch (e) {
        console.error('bcrypt.compare error (legacy column):', e);
        return res.status(500).json({ message: 'Lỗi bcrypt', error: e.message });
      }
    } 
    // 3) If MatKhau exists and is plain text (legacy) -> direct compare
    else if (hashFromMatKhauCol) {
      // plain-text legacy — compare after trimming both sides to avoid stored trailing spaces
      const stored = String(hashFromMatKhauCol).trim();
      const incoming = String(matKhau).trim();
      console.log('Using plaintext MatKhau column. stored length:', stored.length);
      if (stored !== incoming) return res.status(401).json({ message: 'Mật khẩu sai' });
    } 
    // 4) No password column found
    else {
      return res.status(500).json({ message: 'Không có cột mật khẩu hợp lệ trên DB' });
    }

    const payload = {
      MaTaiKhoan: user.MaTaiKhoan,
      TenDangNhap: user.TenDangNhap,
      MaChucVu: user.MaChucVu,
      HoTen: user.HoTen
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/auth/dangky
router.post('/dangky', async (req, res) => {
  const { tenDangNhap, matKhau, hoTen, email, sdt } = req.body;
  if (!tenDangNhap || !matKhau || !hoTen) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

  try {
    // check existing username
    const [existing] = await pool.execute('SELECT MaTaiKhoan FROM TaiKhoan WHERE TenDangNhap = ? LIMIT 1', [tenDangNhap]);
    if (existing && existing.length > 0) return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });

    // hash password
    const hash = await bcrypt.hash(matKhau, 10);

    // insert into TaiKhoan, default role = 4 (Bệnh nhân)
    const insertSql = 'INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await pool.execute(insertSql, [tenDangNhap, hash, 4, hoTen, email || null, sdt || null]);

    const maTaiKhoan = result.insertId;

    // create corresponding BenhNhan record (MaTheBV and other fields left null)
    try {
      await pool.execute('INSERT INTO BenhNhan (MaTaiKhoan, HoTen, SDT) VALUES (?, ?, ?)', [maTaiKhoan, hoTen, sdt || null]);
    } catch (e) {
      // if BenhNhan insert fails, log but continue — account exists regardless
      console.error('Failed to create BenhNhan record:', e.message);
    }

    return res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Dang ky error:', err);
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/auth/reset-password (for admin to reset any password)
// This endpoint allows resetting password - should be protected in production
router.post('/reset-password', async (req, res) => {
  const { tenDangNhap, matKhauMoi } = req.body;
  if (!tenDangNhap || !matKhauMoi) {
    return res.status(400).json({ message: 'Thiếu tên đăng nhập hoặc mật khẩu mới' });
  }

  try {
    // Hash the new password
    const hash = await bcrypt.hash(matKhauMoi, 10);
    
    // Update password
    const [result] = await pool.execute(
      'UPDATE TaiKhoan SET MatKhauHash = ? WHERE TenDangNhap = ?',
      [hash, tenDangNhap]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// GET /api/auth/me -> Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT MaTaiKhoan, TenDangNhap, MaChucVu, HoTen, Email, DienThoai, DiaChi FROM TaiKhoan WHERE MaTaiKhoan = ? LIMIT 1',
      [req.user.MaTaiKhoan]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// GET /api/auth/users -> Get all users (admin only)
router.get('/users', auth, permit(1), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT tk.MaTaiKhoan, tk.TenDangNhap, tk.MaChucVu, tk.HoTen, tk.Email, tk.DienThoai, tk.DiaChi, tk.NgayTao,
              cv.TenChucVu
       FROM TaiKhoan tk
       LEFT JOIN ChucVu cv ON tk.MaChucVu = cv.MaChucVu
       ORDER BY tk.NgayTao DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
