// backend/routes/bacsi.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const controller = require('../controllers/bacsi.controller');

/**
 * Quyền:
 * - Xem danh sách bác sĩ: Tất cả người dùng đã đăng nhập (để đặt lịch)
 * - Thêm bác sĩ: Chỉ admin (MaChucVu=1)
 */

/** GET /api/bacsi/ -> Tất cả người dùng đã đăng nhập */
router.get('/', auth, controller.layTatCaBacSi);

/** POST /api/bacsi/ -> thêm bác sĩ (admin only) */
router.post('/', auth, permit(1), controller.themBacSi);

/** PUT /api/bacsi/:id -> cập nhật bác sĩ (admin only) */
router.put('/:id', auth, permit(1), controller.capNhatBacSi);

/** DELETE /api/bacsi/:id -> xóa bác sĩ (admin only) */
router.delete('/:id', auth, permit(1), controller.xoaBacSi);

module.exports = router;
