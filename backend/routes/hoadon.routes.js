// backend/routes/hoadon.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const controller = require('../controllers/hoadon.controller');
const { poolPromise, sql } = require('../db');

/**
 * Quyền:
 * - Tạo hoá đơn: admin (1)
 * - Xem hoá đơn theo lịch: admin hoặc bệnh nhân chủ lịch
 * - Thanh toán hoá đơn: admin (hoặc bạn có thể mở cho bệnh nhân tự thanh toán)
 */

/** POST /api/hoadon/ -> tạo hóa đơn (admin) */
router.post('/', auth, permit(1), controller.taoHoaDon);

/**
 * GET /api/hoadon/lich/:maLich
 * - nếu admin -> trả về
 * - nếu bệnh nhân -> chỉ trả về nếu lịch thuộc về bệnh nhân đó
 */
router.get('/lich/:maLich', auth, async (req, res) => {
  const maLich = parseInt(req.params.maLich);
  if (!maLich) return res.status(400).json({ message: 'Id lịch không hợp lệ' });

  try {
    const pool = await poolPromise;
    // admin xem mọi hóa đơn
    if (req.user.MaChucVu === 1) return controller.layHoaDonTheoLich(req, res);

    // nếu bệnh nhân -> kiểm tra lịch thuộc về họ
    const rs = await pool.request().input('malich', sql.Int, maLich).query('SELECT MaBenhNhan FROM LichKham WHERE MaLich = @malich');
    const lich = rs.recordset[0];
    if (!lich) return res.status(404).json({ message: 'Lịch không tồn tại' });

    const rs2 = await pool.request().input('matk', sql.Int, req.user.MaTaiKhoan).query('SELECT MaBenhNhan FROM BenhNhan WHERE MaTaiKhoan = @matk');
    const bn = rs2.recordset[0];
    if (!bn || bn.MaBenhNhan !== lich.MaBenhNhan) return res.status(403).json({ message: 'Bạn không có quyền xem hoá đơn này' });

    return controller.layHoaDonTheoLich(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/** PUT /api/hoadon/:id/thanh-toan -> admin (đánh dấu đã thanh toán) */
router.put('/:id/thanh-toan', auth, permit(1), controller.thanhToanHoaDon);

module.exports = router;
