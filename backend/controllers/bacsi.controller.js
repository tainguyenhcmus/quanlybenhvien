// backend/controllers/bacsi.controller.js
const pool = require('../db');

async function layTatCaBacSi(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM BacSi');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function themBacSi(req, res) {
  const { hoTen, chuyenKhoa, bacSiCode, sdt, email } = req.body;
  if (!hoTen) return res.status(400).json({ message: 'Thiếu họ tên bác sĩ' });
  try {
    await pool.execute(
      'INSERT INTO BacSi (HoTen, ChuyenKhoa, BacSiCode, SDT, Email) VALUES (?, ?, ?, ?, ?)',
      [hoTen, chuyenKhoa || null, bacSiCode || null, sdt || null, email || null]
    );
    res.json({ message: 'Thêm bác sĩ thành công' });
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function capNhatBacSi(req, res) {
  const id = parseInt(req.params.id);
  const { hoTen, chuyenKhoa, bacSiCode, sdt, email } = req.body;
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });

  try {
    const updates = [];
    const values = [];
    
    if (hoTen !== undefined) {
      updates.push('HoTen = ?');
      values.push(hoTen);
    }
    if (chuyenKhoa !== undefined) {
      updates.push('ChuyenKhoa = ?');
      values.push(chuyenKhoa);
    }
    if (bacSiCode !== undefined) {
      updates.push('BacSiCode = ?');
      values.push(bacSiCode);
    }
    if (sdt !== undefined) {
      updates.push('SDT = ?');
      values.push(sdt);
    }
    if (email !== undefined) {
      updates.push('Email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
    }

    values.push(id);
    await pool.execute(
      `UPDATE BacSi SET ${updates.join(', ')} WHERE MaBacSi = ?`,
      values
    );
    res.json({ message: 'Cập nhật bác sĩ thành công' });
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function xoaBacSi(req, res) {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });
  try {
    await pool.execute('DELETE FROM BacSi WHERE MaBacSi = ?', [id]);
    res.json({ message: 'Xóa bác sĩ thành công' });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { layTatCaBacSi, themBacSi, capNhatBacSi, xoaBacSi };
