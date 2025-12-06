// backend/controllers/lichkham.controller.js
const pool = require('../db');

async function layTatCaLichKham(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT lk.MaLich, lk.NgayKham, lk.TrangThai, lk.GhiChu,
              bn.MaBenhNhan, bn.HoTen as TenBenhNhan,
              bs.MaBacSi, bs.HoTen as TenBacSi,
              pk.MaPhong, pk.TenPhong
       FROM LichKham lk
       LEFT JOIN BenhNhan bn ON lk.MaBenhNhan = bn.MaBenhNhan
       LEFT JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
       LEFT JOIN PhongKham pk ON lk.MaPhong = pk.MaPhong
       ORDER BY lk.NgayKham DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function datLichKham(req, res) {
  const { MaBenhNhan, MaBacSi, MaPhong, NgayKham, GhiChu } = req.body;
  if (!MaBenhNhan || !MaBacSi || !MaPhong || !NgayKham) {
    return res.status(400).json({ message: 'Thiếu thông tin đặt lịch' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO LichKham (MaBenhNhan, MaBacSi, MaPhong, NgayKham, GhiChu, TrangThai) VALUES (?, ?, ?, ?, ?, ?)',
      [MaBenhNhan, MaBacSi, MaPhong, new Date(NgayKham), GhiChu || null, 'Chờ xác nhận']
    );

    res.json({ message: 'Đặt lịch thành công', id: result.insertId });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function capNhatTrangThai(req, res) {
  const id = parseInt(req.params.id);
  const { TrangThai } = req.body;
  if (!id || !TrangThai) return res.status(400).json({ message: 'Thiếu thông tin' });

  try {
    await pool.execute(
      'UPDATE LichKham SET TrangThai = ? WHERE MaLich = ?',
      [TrangThai, id]
    );
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function layLichTheoBenhNhan(req, res) {
  const maBN = parseInt(req.params.maBenhNhan);
  if (!maBN) return res.status(400).json({ message: 'Id bệnh nhân không hợp lệ' });
  
  try {
    const [rows] = await pool.execute(
      `SELECT lk.MaLich, lk.NgayKham, lk.TrangThai, lk.GhiChu,
              bn.MaBenhNhan, bn.HoTen as TenBenhNhan,
              bs.MaBacSi, bs.HoTen as TenBacSi,
              pk.MaPhong, pk.TenPhong
       FROM LichKham lk
       LEFT JOIN BenhNhan bn ON lk.MaBenhNhan = bn.MaBenhNhan
       LEFT JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
       LEFT JOIN PhongKham pk ON lk.MaPhong = pk.MaPhong
       WHERE lk.MaBenhNhan = ?
       ORDER BY lk.NgayKham DESC`,
      [maBN]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { layTatCaLichKham, datLichKham, capNhatTrangThai, layLichTheoBenhNhan };
