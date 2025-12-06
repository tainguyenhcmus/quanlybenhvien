// backend/routes/hosobenhan.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const controller = require('../controllers/hosobenhan.controller');
const pool = require('../db');

/**
 * Quyền:
 * - Admin (MaChucVu=1): Xem/sửa/xóa tất cả hồ sơ
 * - Bác sĩ (MaChucVu=2): Xem/sửa hồ sơ của bệnh nhân họ khám
 * - Bệnh nhân (MaChucVu=4): Chỉ xem hồ sơ của chính họ
 */

/** GET /api/hosobenhan/ -> admin xem tất cả, bác sĩ xem hồ sơ của họ */
router.get('/', auth, async (req, res) => {
  try {
    // Admin can see all records
    if (req.user.MaChucVu === 1) {
      return controller.layTatCaHoSo(req, res);
    }
    
    // Doctor can see records for their appointments
    if (req.user.MaChucVu === 2) {
      const [bsRows] = await pool.execute(
        'SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1',
        [req.user.MaTaiKhoan]
      );
      if (bsRows.length === 0) {
        return res.status(403).json({ message: 'Không tìm thấy thông tin bác sĩ' });
      }
      const maBacSi = bsRows[0].MaBacSi;
      
      // Get all medical records for this doctor's appointments
      const [rows] = await pool.execute(
        `SELECT h.MaHoSo, h.MaLich, h.ChanDoan, h.Thuoc, h.KetQuaXN, h.GhiChu, h.NgayCapNhat,
                lk.MaBenhNhan, lk.MaBacSi, lk.NgayKham, lk.TrangThai,
                bn.HoTen as TenBenhNhan,
                bs.HoTen as TenBacSi, bs.ChuyenKhoa
         FROM HoSoBenhAn h
         LEFT JOIN LichKham lk ON h.MaLich = lk.MaLich
         LEFT JOIN BenhNhan bn ON lk.MaBenhNhan = bn.MaBenhNhan
         LEFT JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
         WHERE lk.MaBacSi = ?
         ORDER BY h.NgayCapNhat DESC`,
        [maBacSi]
      );
      return res.json(rows);
    }
    
    return res.status(403).json({ message: 'Bạn không có quyền xem danh sách hồ sơ bệnh án' });
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** GET /api/hosobenhan/benh-nhan/:maBenhNhan -> admin hoặc bệnh nhân chính chủ */
router.get('/benh-nhan/:maBenhNhan', auth, async (req, res) => {
  const maBN = parseInt(req.params.maBenhNhan);
  if (!maBN) return res.status(400).json({ message: 'Id bệnh nhân không hợp lệ' });

  try {
    // Admin can see any patient's records
    if (req.user.MaChucVu === 1) {
      return controller.layHoSoTheoBenhNhan(req, res);
    }

    // Patient can only see their own records
    if (req.user.MaChucVu === 4) {
      const [selfRows] = await pool.execute(
        'SELECT MaBenhNhan FROM BenhNhan WHERE MaTaiKhoan = ? LIMIT 1',
        [req.user.MaTaiKhoan]
      );
      const self = selfRows[0];
      if (!self || self.MaBenhNhan !== maBN) {
        return res.status(403).json({ message: 'Bạn không có quyền xem hồ sơ này' });
      }
      return controller.layHoSoTheoBenhNhan(req, res);
    }

    // Doctor can see records of patients they treated
    if (req.user.MaChucVu === 2) {
      // Check if doctor has treated this patient
      const [bsRows] = await pool.execute(
        'SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1',
        [req.user.MaTaiKhoan]
      );
      if (bsRows.length === 0) {
        return res.status(403).json({ message: 'Không tìm thấy thông tin bác sĩ' });
      }
      const maBacSi = bsRows[0].MaBacSi;
      
      // Check if doctor has any appointment with this patient
      const [checkRows] = await pool.execute(
        'SELECT COUNT(*) as count FROM LichKham WHERE MaBenhNhan = ? AND MaBacSi = ?',
        [maBN, maBacSi]
      );
      if (checkRows[0].count === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền xem hồ sơ này' });
      }
      return controller.layHoSoTheoBenhNhan(req, res);
    }

    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  } catch (err) {
    console.error('Error checking permissions:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** GET /api/hosobenhan/lich/:maLich -> Get medical record by appointment */
router.get('/lich/:maLich', auth, async (req, res) => {
  const maLich = parseInt(req.params.maLich);
  if (!maLich) return res.status(400).json({ message: 'Id lịch khám không hợp lệ' });

  try {
    // Check permissions - first verify appointment exists
    const [lichRows] = await pool.execute(
      'SELECT MaBenhNhan, MaBacSi FROM LichKham WHERE MaLich = ? LIMIT 1',
      [maLich]
    );
    if (lichRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch khám' });
    }
    const lich = lichRows[0];

    // Check permissions
    let hasPermission = false;

    // Admin can see any
    if (req.user.MaChucVu === 1) {
      hasPermission = true;
    }
    // Patient can see their own
    else if (req.user.MaChucVu === 4) {
      const [selfRows] = await pool.execute(
        'SELECT MaBenhNhan FROM BenhNhan WHERE MaTaiKhoan = ? LIMIT 1',
        [req.user.MaTaiKhoan]
      );
      const self = selfRows[0];
      if (self && self.MaBenhNhan === lich.MaBenhNhan) {
        hasPermission = true;
      }
    }
    // Doctor can see records for their appointments
    else if (req.user.MaChucVu === 2) {
      const [bsRows] = await pool.execute(
        'SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1',
        [req.user.MaTaiKhoan]
      );
      if (bsRows.length > 0 && bsRows[0].MaBacSi === lich.MaBacSi) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({ message: 'Bạn không có quyền xem hồ sơ này' });
    }

    // If permission granted, try to get the record (may not exist yet)
    return controller.layHoSoTheoLich(req, res);
  } catch (err) {
    console.error('Error checking permissions:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** POST /api/hosobenhan/ -> Tạo hồ sơ (admin hoặc bác sĩ) */
router.post('/', auth, async (req, res) => {
  if (req.user.MaChucVu !== 1 && req.user.MaChucVu !== 2) {
    return res.status(403).json({ message: 'Bạn không có quyền tạo hồ sơ bệnh án' });
  }
  return controller.taoHoSo(req, res);
});

/** PUT /api/hosobenhan/:id -> Cập nhật hồ sơ (admin hoặc bác sĩ) */
router.put('/:id', auth, async (req, res) => {
  if (req.user.MaChucVu !== 1 && req.user.MaChucVu !== 2) {
    return res.status(403).json({ message: 'Bạn không có quyền cập nhật hồ sơ bệnh án' });
  }
  return controller.capNhatHoSo(req, res);
});

/** DELETE /api/hosobenhan/:id -> Xóa hồ sơ (admin only) */
router.delete('/:id', auth, permit(1), controller.xoaHoSo);

module.exports = router;

