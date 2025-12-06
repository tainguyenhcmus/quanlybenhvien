// backend/controllers/hosobenhan.controller.js
const pool = require('../db');

async function layTatCaHoSo(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT h.MaHoSo, h.MaLich, h.ChanDoan, h.Thuoc, h.KetQuaXN, h.GhiChu, h.NgayCapNhat,
              lk.MaBenhNhan, lk.MaBacSi, lk.NgayKham,
              bn.HoTen as TenBenhNhan,
              bs.HoTen as TenBacSi
       FROM HoSoBenhAn h
       LEFT JOIN LichKham lk ON h.MaLich = lk.MaLich
       LEFT JOIN BenhNhan bn ON lk.MaBenhNhan = bn.MaBenhNhan
       LEFT JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
       ORDER BY h.NgayCapNhat DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function layHoSoTheoBenhNhan(req, res) {
  const maBN = parseInt(req.params.maBenhNhan);
  if (!maBN) return res.status(400).json({ message: 'Id bệnh nhân không hợp lệ' });
  
  try {
    const [rows] = await pool.execute(
      `SELECT h.MaHoSo, h.MaLich, h.ChanDoan, h.Thuoc, h.KetQuaXN, h.GhiChu, h.NgayCapNhat,
              lk.MaBenhNhan, lk.MaBacSi, lk.NgayKham, lk.TrangThai,
              bs.HoTen as TenBacSi, bs.ChuyenKhoa
       FROM HoSoBenhAn h
       LEFT JOIN LichKham lk ON h.MaLich = lk.MaLich
       LEFT JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
       WHERE lk.MaBenhNhan = ?
       ORDER BY h.NgayCapNhat DESC`,
      [maBN]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching patient medical records:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function layHoSoTheoLich(req, res) {
  const maLich = parseInt(req.params.maLich);
  if (!maLich) return res.status(400).json({ message: 'Id lịch khám không hợp lệ' });
  
  try {
    const [rows] = await pool.execute(
      `SELECT h.MaHoSo, h.MaLich, h.ChanDoan, h.Thuoc, h.KetQuaXN, h.GhiChu, h.NgayCapNhat,
              lk.MaBenhNhan, lk.MaBacSi, lk.NgayKham,
              bn.HoTen as TenBenhNhan,
              bs.HoTen as TenBacSi
       FROM HoSoBenhAn h
       LEFT JOIN LichKham lk ON h.MaLich = lk.MaLich
       LEFT JOIN BenhNhan bn ON lk.MaBenhNhan = bn.MaBenhNhan
       LEFT JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
       WHERE h.MaLich = ?
       LIMIT 1`,
      [maLich]
    );
    // Return 404 if no record exists - this is expected when creating a new record
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Chưa có hồ sơ bệnh án cho lịch khám này' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching medical record by appointment:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function taoHoSo(req, res) {
  const { MaLich, ChanDoan, Thuoc, KetQuaXN, GhiChu } = req.body;
  if (!MaLich) return res.status(400).json({ message: 'Thiếu MaLich' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO HoSoBenhAn (MaLich, ChanDoan, Thuoc, KetQuaXN, GhiChu) VALUES (?, ?, ?, ?, ?)',
      [MaLich, ChanDoan || null, Thuoc || null, KetQuaXN || null, GhiChu || null]
    );
    res.json({ message: 'Tạo hồ sơ bệnh án thành công', id: result.insertId });
  } catch (err) {
    console.error('Error creating medical record:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function capNhatHoSo(req, res) {
  const id = parseInt(req.params.id);
  const { ChanDoan, Thuoc, KetQuaXN, GhiChu } = req.body;
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });

  try {
    const updates = [];
    const values = [];
    
    if (ChanDoan !== undefined) {
      updates.push('ChanDoan = ?');
      values.push(ChanDoan);
    }
    if (Thuoc !== undefined) {
      updates.push('Thuoc = ?');
      values.push(Thuoc);
    }
    if (KetQuaXN !== undefined) {
      updates.push('KetQuaXN = ?');
      values.push(KetQuaXN);
    }
    if (GhiChu !== undefined) {
      updates.push('GhiChu = ?');
      values.push(GhiChu);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
    }

    values.push(id);
    await pool.execute(
      `UPDATE HoSoBenhAn SET ${updates.join(', ')}, NgayCapNhat = NOW() WHERE MaHoSo = ?`,
      values
    );
    res.json({ message: 'Cập nhật hồ sơ bệnh án thành công' });
  } catch (err) {
    console.error('Error updating medical record:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function xoaHoSo(req, res) {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });
  try {
    await pool.execute('DELETE FROM HoSoBenhAn WHERE MaHoSo = ?', [id]);
    res.json({ message: 'Xóa hồ sơ bệnh án thành công' });
  } catch (err) {
    console.error('Error deleting medical record:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { 
  layTatCaHoSo, 
  layHoSoTheoBenhNhan, 
  layHoSoTheoLich, 
  taoHoSo, 
  capNhatHoSo, 
  xoaHoSo 
};

