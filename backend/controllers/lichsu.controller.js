const pool = require('../db');

async function layLichSu(req, res) {
  try {
    const maLichTruc = req.query.maLichTruc ? parseInt(req.query.maLichTruc) : null;
    let sql = `
      SELECT ls.MaLichSu, ls.MaLichTruc, ls.LoaiHanhDong, ls.MoTa,
             DATE_FORMAT(ls.NgayTao, '%Y-%m-%d %H:%i:%s') AS NgayTao,
             tk.HoTen AS NguoiThucHien, tk.TenDangNhap,
             DATE_FORMAT(lt.NgayTruc, '%Y-%m-%d') AS NgayTruc, lt.CaTruc
      FROM LichSuLichTruc ls
      LEFT JOIN TaiKhoan tk ON ls.MaTaiKhoan = tk.MaTaiKhoan
      LEFT JOIN LichTruc lt ON ls.MaLichTruc = lt.MaLichTruc
    `;
    const params = [];

    if (req.user.MaChucVu === 2) {
      sql += ` WHERE ls.MaLichTruc IN (
        SELECT MaLichTruc FROM LichTruc
        WHERE MaBacSi = (SELECT MaBacSi FROM BacSi WHERE MaTaiKhoan = ? LIMIT 1)
      ) OR ls.MaTaiKhoan = ?`;
      params.push(req.user.MaTaiKhoan, req.user.MaTaiKhoan);
      if (maLichTruc) {
        sql += ' AND ls.MaLichTruc = ?';
        params.push(maLichTruc);
      }
    } else if (req.user.MaChucVu === 1) {
      if (maLichTruc) {
        sql += ' WHERE ls.MaLichTruc = ?';
        params.push(maLichTruc);
      }
    } else {
      return res.status(403).json({ message: 'Không có quyền xem lịch sử' });
    }

    sql += ' ORDER BY ls.NgayTao DESC LIMIT 100';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { layLichSu };
