// backend/controllers/phongkham.controller.js
const pool = require('../db');

async function layTatCaPhongKham(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT MaPhong, TenPhong, MoTa FROM PhongKham ORDER BY MaPhong'
    );
    res.json(rows);
  } catch (err) {
    console.error('layTatCaPhongKham', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { layTatCaPhongKham };
