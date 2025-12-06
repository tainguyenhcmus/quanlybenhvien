// backend/routes/benhnhan.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware'); // dùng permit(1) để chỉ admin
const controller = require('../controllers/benhnhan.controller');
const pool = require('../db');

/**
 * Lưu ý quyền:
 * - Admin (MaChucVu=1) có thể xem/sửa/xóa tất cả bệnh nhân.
 * - Bệnh nhân (MaChucVu=4) chỉ được xem/cập nhật thông tin bản thân.
 */

/** GET /api/benhnhan/  -> admin only */
router.get('/', auth, permit(1), controller.layTatCaBenhNhan);

/** GET /api/benhnhan/me -> thông tin bệnh nhân của user hiện tại */
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM BenhNhan WHERE MaTaiKhoan = ? LIMIT 1',
      [req.user.MaTaiKhoan]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bệnh nhân' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching patient info:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** GET /api/benhnhan/:id -> admin hoặc chính chủ (bệnh nhân) */
router.get('/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM BenhNhan WHERE MaBenhNhan = ? LIMIT 1',
      [id]
    );
    const bn = rows[0];
    if (!bn) return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });

    // nếu không phải admin, kiểm tra xem tài khoản có phải chủ sở hữu
    if (req.user.MaChucVu !== 1) {
      // lấy MaBenhNhan của user hiện tại
      const [selfRows] = await pool.execute(
        'SELECT MaBenhNhan FROM BenhNhan WHERE MaTaiKhoan = ? LIMIT 1',
        [req.user.MaTaiKhoan]
      );
      const self = selfRows[0];
      if (!self || self.MaBenhNhan !== bn.MaBenhNhan) {
        return res.status(403).json({ message: 'Bạn không có quyền xem thông tin này' });
      }
    }

    res.json(bn);
  } catch (err) {
    console.error('Error fetching patient by ID:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** PUT /api/benhnhan/:id -> cập nhật (admin hoặc chính chủ) */
router.put('/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { hoTen, sdt, diaChi, ngaySinh, gioiTinh } = req.body;
  if (!id) return res.status(400).json({ message: 'Id không hợp lệ' });

  try {
    const [rows] = await pool.execute(
      'SELECT MaBenhNhan, MaTaiKhoan FROM BenhNhan WHERE MaBenhNhan = ? LIMIT 1',
      [id]
    );
    const bn = rows[0];
    if (!bn) return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });

    // kiểm tra quyền
    if (req.user.MaChucVu !== 1) {
      const [selfRows] = await pool.execute(
        'SELECT MaBenhNhan FROM BenhNhan WHERE MaTaiKhoan = ? LIMIT 1',
        [req.user.MaTaiKhoan]
      );
      const self = selfRows[0];
      if (!self || self.MaBenhNhan !== bn.MaBenhNhan) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật' });
      }
    }

    // Build update query dynamically based on provided fields
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
});

/** DELETE /api/benhnhan/:id -> admin only */
router.delete('/:id', auth, permit(1), controller.xoaBenhNhan);

module.exports = router;
