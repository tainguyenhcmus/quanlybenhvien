const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const permit = require('../middleware/role.middleware');
const controller = require('../controllers/lichtruc.controller');
const aiController = require('../controllers/lichtrucAi.controller');
const pool = require('../db');

/**
 * Quyền:
 * - Admin (MaChucVu=1): xem/sửa/xóa/duyệt mọi lịch trực
 * - Bác sĩ (MaChucVu=2): xem lịch trực của mình, đăng ký ca trực mới
 */

/** AI tổng quan + chat (admin) — đăng ký trước các route tham số */
router.get('/ai/tong-quan', auth, permit(1), aiController.tongQuan);
router.post('/ai/chat', auth, permit(1), aiController.chat);
router.post('/ai/apply', auth, permit(1), aiController.applyDraft);

/** GET /api/lichtruc/ca-doi -> bác sĩ xem ca trực cùng khoa (để hoán đổi) */
router.get('/ca-doi', auth, permit(2), async (req, res) => {
  const caDoiQuery = `
    SELECT lt.MaLichTruc, DATE_FORMAT(lt.NgayTruc, '%Y-%m-%d') AS NgayTruc, lt.CaTruc, lt.TrangThai, lt.GhiChu,
           bs.MaBacSi, bs.HoTen AS TenBacSi, bs.ChuyenKhoa,
           pk.MaPhong, pk.TenPhong
    FROM LichTruc lt
    LEFT JOIN BacSi bs ON lt.MaBacSi = bs.MaBacSi
    LEFT JOIN PhongKham pk ON lt.MaPhong = pk.MaPhong
    WHERE lt.TrangThai = 'Đã duyệt'
      AND lt.NgayTruc >= CURDATE()
      AND lt.MaBacSi != (SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1)
      AND bs.ChuyenKhoa = (SELECT ChuyenKhoa FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1)
      AND bs.ChuyenKhoa IS NOT NULL AND bs.ChuyenKhoa != ''
  `;
  const pendingFilter = `
      AND lt.MaLichTruc NOT IN (
        SELECT MaLichTrucGui FROM YeuCauHoanDoiCa WHERE TrangThai IN ('Chờ xác nhận', 'Chờ duyệt')
        UNION
        SELECT MaLichTrucNhan FROM YeuCauHoanDoiCa WHERE MaLichTrucNhan IS NOT NULL AND TrangThai IN ('Chờ xác nhận', 'Chờ duyệt')
      )
    ORDER BY lt.NgayTruc ASC, lt.CaTruc`;

  try {
    const [rows] = await pool.execute(caDoiQuery + pendingFilter, [req.user.MaTaiKhoan, req.user.MaTaiKhoan]);
    res.json(rows);
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE' && err.message.includes('YeuCauHoanDoiCa')) {
      const [rows] = await pool.execute(
        caDoiQuery + ' ORDER BY lt.NgayTruc ASC, lt.CaTruc',
        [req.user.MaTaiKhoan, req.user.MaTaiKhoan]
      );
      return res.json(rows);
    }
    console.error('Error fetching swappable shifts:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** GET /api/lichtruc/ -> admin xem tất cả, bác sĩ xem lịch của mình */
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.MaChucVu === 1) {
      return controller.layTatCaLichTruc(req, res);
    }

    if (req.user.MaChucVu === 2) {
      const [rows] = await pool.execute(
        `SELECT lt.MaLichTruc, DATE_FORMAT(lt.NgayTruc, '%Y-%m-%d') AS NgayTruc, lt.CaTruc, lt.TrangThai, lt.GhiChu, lt.NgayTao,
                bs.MaBacSi, bs.HoTen AS TenBacSi, bs.ChuyenKhoa,
                pk.MaPhong, pk.TenPhong
         FROM LichTruc lt
         LEFT JOIN BacSi bs ON lt.MaBacSi = bs.MaBacSi
         LEFT JOIN PhongKham pk ON lt.MaPhong = pk.MaPhong
         WHERE lt.MaBacSi = (SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1)
         ORDER BY lt.NgayTruc DESC, lt.CaTruc`,
        [req.user.MaTaiKhoan]
      );
      return res.json(rows);
    }

    return res.status(403).json({ message: 'Bạn không có quyền xem lịch trực' });
  } catch (err) {
    console.error('Error fetching on-call schedules:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** GET /api/lichtruc/bac-si/:maBacSi */
router.get('/bac-si/:maBacSi', auth, async (req, res) => {
  const maBacSi = parseInt(req.params.maBacSi);
  if (!maBacSi) return res.status(400).json({ message: 'Mã bác sĩ không hợp lệ' });

  try {
    if (req.user.MaChucVu === 1) {
      return controller.layLichTrucTheoBacSi(req, res);
    }

    if (req.user.MaChucVu === 2) {
      const [selfRows] = await pool.execute(
        'SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1',
        [req.user.MaTaiKhoan]
      );
      if (!selfRows.length || selfRows[0].MaBacSi !== maBacSi) {
        return res.status(403).json({ message: 'Bạn chỉ có thể xem lịch trực của chính mình' });
      }
      return controller.layLichTrucTheoBacSi(req, res);
    }

    return res.status(403).json({ message: 'Bạn không có quyền xem lịch trực' });
  } catch (err) {
    console.error('Error fetching doctor on-call schedules:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** POST /api/lichtruc/hang-loat -> admin tạo lịch cả tuần */
router.post('/hang-loat', auth, permit(1), controller.themLichTrucHangLoat);

/**
 * POST /api/lichtruc/
 * Admin: tạo lịch trực cho bất kỳ bác sĩ (tự động duyệt)
 * Bác sĩ: đăng ký ca trực cho chính mình (chờ duyệt)
 */
router.post('/', auth, async (req, res) => {
  try {
    const user = req.user;
    let { MaBacSi, MaPhong, NgayTruc, CaTruc, GhiChu } = req.body;

    if (user.MaChucVu === 2) {
      const [rows] = await pool.execute(
        'SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1',
        [user.MaTaiKhoan]
      );
      if (!rows.length) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin bác sĩ của bạn' });
      }
      MaBacSi = rows[0].MaBacSi;
      req.body.MaBacSi = MaBacSi;
      req.body.TrangThai = 'Chờ duyệt';
    } else if (user.MaChucVu === 1) {
      if (!MaBacSi) return res.status(400).json({ message: 'Thiếu MaBacSi' });
      req.body.TrangThai = 'Đã duyệt';
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền đăng ký lịch trực' });
    }

    return controller.themLichTruc(req, res);
  } catch (err) {
    console.error('Error creating on-call schedule:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

/** PUT /api/lichtruc/:id -> admin cập nhật toàn bộ */
router.put('/:id', auth, permit(1), controller.capNhatLichTruc);

/** PUT /api/lichtruc/:id/trangthai -> admin duyệt/từ chối */
router.put('/:id/trangthai', auth, permit(1), controller.capNhatTrangThai);

/** DELETE /api/lichtruc/:id -> admin xóa bất kỳ; bác sĩ xóa ca chờ duyệt của mình */
router.delete('/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id lịch trực không hợp lệ' });

  try {
    if (req.user.MaChucVu === 1) {
      return controller.xoaLichTruc(req, res);
    }

    if (req.user.MaChucVu === 2) {
      const [rows] = await pool.execute(
        `SELECT lt.MaLichTruc FROM LichTruc lt
         WHERE lt.MaLichTruc = ?
           AND lt.MaBacSi = (SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1)
           AND lt.TrangThai = 'Chờ duyệt'`,
        [id, req.user.MaTaiKhoan]
      );
      if (!rows.length) {
        return res.status(403).json({ message: 'Bạn chỉ có thể hủy ca trực đang chờ duyệt của mình' });
      }
      return controller.xoaLichTruc(req, res);
    }

    return res.status(403).json({ message: 'Bạn không có quyền xóa lịch trực' });
  } catch (err) {
    console.error('Error deleting on-call schedule:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
