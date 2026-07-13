const pool = require('../db');

async function layThongBao(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT MaThongBao, TieuDe, NoiDung, Loai, MaLienKet, DaDoc,
              DATE_FORMAT(NgayTao, '%Y-%m-%d %H:%i:%s') AS NgayTao
       FROM ThongBao
       WHERE MaTaiKhoan = ?
       ORDER BY NgayTao DESC
       LIMIT 50`,
      [req.user.MaTaiKhoan]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function demChuaDoc(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS SoLuong FROM ThongBao WHERE MaTaiKhoan = ? AND DaDoc = 0',
      [req.user.MaTaiKhoan]
    );
    res.json({ SoLuong: rows[0]?.SoLuong || 0 });
  } catch (err) {
    console.error('Error counting notifications:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function danhDauDaDoc(req, res) {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });
  try {
    await pool.execute(
      'UPDATE ThongBao SET DaDoc = 1 WHERE MaThongBao = ? AND MaTaiKhoan = ?',
      [id, req.user.MaTaiKhoan]
    );
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function danhDauTatCaDaDoc(req, res) {
  try {
    await pool.execute(
      'UPDATE ThongBao SET DaDoc = 1 WHERE MaTaiKhoan = ? AND DaDoc = 0',
      [req.user.MaTaiKhoan]
    );
    res.json({ message: 'Đã đọc tất cả thông báo' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { layThongBao, demChuaDoc, danhDauDaDoc, danhDauTatCaDaDoc };
