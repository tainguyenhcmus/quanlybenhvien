// backend/controllers/hoadon.controller.js
const { poolPromise, sql } = require('../db');

async function taoHoaDon(req, res) {
  const { MaLich, SoTien } = req.body;
  if (!MaLich || SoTien == null) return res.status(400).json({ message: 'Thiếu thông tin hóa đơn' });

  try {
    const pool = await poolPromise;
    const insert = await pool.request()
      .input('malich', sql.Int, MaLich)
      .input('sotien', sql.Decimal(18,2), SoTien)
      .query('INSERT INTO HoaDon (MaLich, SoTien, DaThanhToan) VALUES (@malich,@sotien, 0); SELECT SCOPE_IDENTITY() AS id;');

    res.json({ message: 'Tạo hóa đơn thành công', id: insert.recordset[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

async function layHoaDonTheoLich(req, res) {
  const maLich = parseInt(req.params.maLich);
  if (!maLich) return res.status(400).json({ message: 'Id lịch không hợp lệ' });
  try {
    const pool = await poolPromise;
    const rs = await pool.request().input('malich', sql.Int, maLich)
      .query('SELECT * FROM HoaDon WHERE MaLich = @malich');
    res.json(rs.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

async function thanhToanHoaDon(req, res) {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id hóa đơn không hợp lệ' });
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, id).query('UPDATE HoaDon SET DaThanhToan = 1 WHERE MaHoaDon = @id');
    res.json({ message: 'Thanh toán thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

module.exports = { taoHoaDon, layHoaDonTheoLich, thanhToanHoaDon };
