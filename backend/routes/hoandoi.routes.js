const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const controller = require('../controllers/hoandoi.controller');
const pool = require('../db');

async function getMaBacSi(req) {
  const [rows] = await pool.execute(
    'SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1',
    [req.user.MaTaiKhoan]
  );
  return rows[0]?.MaBacSi || null;
}

/** GET /api/hoandoi/ */
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.MaChucVu === 1) {
      return controller.layTatCa(req, res);
    }
    if (req.user.MaChucVu === 2) {
      const maBacSi = await getMaBacSi(req);
      if (!maBacSi) return res.status(400).json({ message: 'Không tìm thấy thông tin bác sĩ' });
      req.maBacSi = maBacSi;
      return controller.layTheoBacSi(req, res);
    }
    return res.status(403).json({ message: 'Bạn không có quyền xem yêu cầu hoán đổi ca' });
  } catch (err) {
    console.error('Error fetching swap requests:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** POST /api/hoandoi/ - bác sĩ tạo yêu cầu nhượng/hoán đổi ca */
router.post('/', auth, permit(2), async (req, res) => {
  try {
    const maBacSi = await getMaBacSi(req);
    if (!maBacSi) return res.status(400).json({ message: 'Không tìm thấy thông tin bác sĩ' });
    req.maBacSi = maBacSi;
    return controller.taoYeuCau(req, res);
  } catch (err) {
    console.error('Error creating swap request:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** PUT /api/hoandoi/:id/xacnhan - bác sĩ nhận xác nhận */
router.put('/:id/xacnhan', auth, permit(2), async (req, res) => {
  try {
    const maBacSi = await getMaBacSi(req);
    if (!maBacSi) return res.status(400).json({ message: 'Không tìm thấy thông tin bác sĩ' });
    req.maBacSi = maBacSi;
    return controller.xacNhan(req, res);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** PUT /api/hoandoi/:id/tuchoi */
router.put('/:id/tuchoi', auth, permit(2), async (req, res) => {
  try {
    const maBacSi = await getMaBacSi(req);
    if (!maBacSi) return res.status(400).json({ message: 'Không tìm thấy thông tin bác sĩ' });
    req.maBacSi = maBacSi;
    return controller.tuChoi(req, res);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** PUT /api/hoandoi/:id/huy - người gửi hủy */
router.put('/:id/huy', auth, permit(2), async (req, res) => {
  try {
    const maBacSi = await getMaBacSi(req);
    if (!maBacSi) return res.status(400).json({ message: 'Không tìm thấy thông tin bác sĩ' });
    req.maBacSi = maBacSi;
    return controller.huyYeuCau(req, res);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** PUT /api/hoandoi/:id/trangthai - admin duyệt/từ chối */
router.put('/:id/trangthai', auth, permit(1), controller.duyetYeuCau);

module.exports = router;
