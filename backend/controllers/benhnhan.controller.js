// backend/controllers/benhnhan.controller.js
const pool = require('../db');

async function layTatCaBenhNhan(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM BenhNhan');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all patients:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function layBenhNhanTheoId(req, res) {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM BenhNhan WHERE MaBenhNhan = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching patient by ID:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function capNhatBenhNhan(req, res) {
  const id = parseInt(req.params.id);
  const { hoTen, sdt, diaChi, ngaySinh, gioiTinh } = req.body;
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });

  try {
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (hoTen !== undefined) {
      updates.push('HoTen = ?');
      values.push(hoTen);
    }
    if (sdt !== undefined) {
      updates.push('SDT = ?');
      values.push(sdt);
    }
    if (diaChi !== undefined) {
      updates.push('DiaChi = ?');
      values.push(diaChi);
    }
    if (ngaySinh !== undefined) {
      updates.push('NgaySinh = ?');
      values.push(ngaySinh || null);
    }
    if (gioiTinh !== undefined) {
      updates.push('GioiTinh = ?');
      values.push(gioiTinh);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
    }

    values.push(id);
    await pool.execute(
      `UPDATE BenhNhan SET ${updates.join(', ')} WHERE MaBenhNhan = ?`,
      values
    );
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function xoaBenhNhan(req, res) {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });
  try {
    await pool.execute('DELETE FROM BenhNhan WHERE MaBenhNhan = ?', [id]);
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { layTatCaBenhNhan, layBenhNhanTheoId, capNhatBenhNhan, xoaBenhNhan };
