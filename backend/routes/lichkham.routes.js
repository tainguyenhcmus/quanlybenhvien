// backend/routes/lichkham.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const controller = require('../controllers/lichkham.controller');
const pool = require('../db');

/**
 * Quyền:
 * - Bệnh nhân (MaChucVu=4) có thể đặt lịch (cho chính họ) và xem lịch của chính họ.
 * - Admin (MaChucVu=1) xem/sửa/hủy mọi lịch.
 * - Bác sĩ (MaChucVu=2) có thể xem lịch của họ.
 */

/** GET /api/lichkham/ -> admin xem tất cả, bác sĩ xem lịch của họ */
router.get('/', auth, async (req, res) => {
  try {
    // Admin can see all appointments
    if (req.user.MaChucVu === 1) {
      return controller.layTatCaLichKham(req, res);
    }
    
    // Doctor can see their own appointments
    if (req.user.MaChucVu === 2) {
      // Get doctor's appointments
      const [rows] = await pool.execute(
        `SELECT lk.MaLich, lk.NgayKham, lk.TrangThai, lk.GhiChu,
                bn.MaBenhNhan, bn.HoTen as TenBenhNhan,
                bs.MaBacSi, bs.HoTen as TenBacSi,
                pk.MaPhong, pk.TenPhong
         FROM LichKham lk
         LEFT JOIN BenhNhan bn ON lk.MaBenhNhan = bn.MaBenhNhan
         LEFT JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
         LEFT JOIN PhongKham pk ON lk.MaPhong = pk.MaPhong
         WHERE lk.MaBacSi = (SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ?)
         ORDER BY lk.NgayKham DESC`,
        [req.user.MaTaiKhoan]
      );
      return res.json(rows);
    }
    
    // Others not allowed
    return res.status(403).json({ message: 'Bạn không có quyền xem danh sách lịch khám' });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/**
 * POST /api/lichkham/
 * Body: { MaBenhNhan, MaBacSi, MaPhong, NgayKham, GhiChu }
 * Nếu user là bệnh nhân thì bắt buộc MaBenhNhan phải là của họ (hoặc omit và backend lấy từ token).
 */
router.post('/', auth, async (req, res) => {
  try {
    const user = req.user;
    let { MaBenhNhan, MaBacSi, MaPhong, NgayKham, GhiChu } = req.body;

    // nếu là bệnh nhân, lấy MaBenhNhan từ bảng BenhNhan theo MaTaiKhoan
    if (user.MaChucVu === 4) {
      const [rows] = await pool.execute(
        'SELECT MaBenhNhan FROM BenhNhan WHERE MaTaiKhoan = ? LIMIT 1',
        [user.MaTaiKhoan]
      );
      if (rows.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin bệnh nhân của bạn' });
      }
      MaBenhNhan = rows[0].MaBenhNhan;
    } else {
      // admin có thể đặt lịch cho bệnh nhân khác (cần MaBenhNhan)
      if (!MaBenhNhan) return res.status(400).json({ message: 'Thiếu MaBenhNhan' });
    }

    // kiểm tra các trường bắt buộc
    if (!MaBenhNhan || !MaBacSi || !MaPhong || !NgayKham) {
      return res.status(400).json({ message: 'Thiếu thông tin đặt lịch' });
    }

    // gọi controller datLichKham
    req.body.MaBenhNhan = MaBenhNhan; // đảm bảo giá trị đúng
    return controller.datLichKham(req, res);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** PUT /api/lichkham/:id/trangthai -> admin cập nhật trạng thái */
router.put('/:id/trangthai', auth, permit(1), controller.capNhatTrangThai);

/** GET /api/lichkham/benh-nhan/:maBenhNhan -> admin hoặc bệnh nhân chính chủ */
router.get('/benh-nhan/:maBenhNhan', auth, async (req, res) => {
  const maBN = parseInt(req.params.maBenhNhan);
  if (!maBN) return res.status(400).json({ message: 'Id bệnh nhân không hợp lệ' });

  try {
    // nếu admin -> trả về
    if (req.user.MaChucVu === 1) return controller.layLichTheoBenhNhan(req, res);

    // nếu bệnh nhân -> kiểm tra là chính chủ
    const [selfRows] = await pool.execute(
      'SELECT MaBenhNhan FROM BenhNhan WHERE MaTaiKhoan = ? LIMIT 1',
      [req.user.MaTaiKhoan]
    );
    const self = selfRows[0];
    if (!self || self.MaBenhNhan !== maBN) {
      return res.status(403).json({ message: 'Bạn không có quyền xem lịch của bệnh nhân này' });
    }

    return controller.layLichTheoBenhNhan(req, res);
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
