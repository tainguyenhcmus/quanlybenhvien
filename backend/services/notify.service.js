const pool = require('../db');
const { guiThongBaoNgoai } = require('./messaging.service');

async function taoThongBao({ MaTaiKhoan, TieuDe, NoiDung, Loai = 'HeThong', MaLienKet = null }, db = pool) {
  if (!MaTaiKhoan || !TieuDe) return;
  await db.execute(
    'INSERT INTO ThongBao (MaTaiKhoan, TieuDe, NoiDung, Loai, MaLienKet) VALUES (?, ?, ?, ?, ?)',
    [MaTaiKhoan, TieuDe, NoiDung || null, Loai, MaLienKet]
  );
  // Email/SMS song song — không chặn response nếu gửi thất bại
  setImmediate(() => {
    guiThongBaoNgoai(MaTaiKhoan, TieuDe, NoiDung).catch(() => {});
  });
}

async function thongBaoAdmins({ TieuDe, NoiDung, Loai = 'LichTruc', MaLienKet = null }, db = pool) {
  const [admins] = await db.execute('SELECT MaTaiKhoan FROM TaiKhoan WHERE MaChucVu = 1');
  for (const admin of admins) {
    await taoThongBao({ MaTaiKhoan: admin.MaTaiKhoan, TieuDe, NoiDung, Loai, MaLienKet }, db);
  }
}

async function getMaTaiKhoanBacSi(maBacSi, db = pool) {
  const [rows] = await db.execute(
    'SELECT MaTaiKhoan FROM BacSi WHERE MaBacSi = ? AND MaTaiKhoan IS NOT NULL LIMIT 1',
    [maBacSi]
  );
  return rows[0]?.MaTaiKhoan || null;
}

async function ghiLichSu({ MaLichTruc, LoaiHanhDong, MoTa, MaTaiKhoan }, db = pool) {
  await db.execute(
    'INSERT INTO LichSuLichTruc (MaLichTruc, LoaiHanhDong, MoTa, MaTaiKhoan) VALUES (?, ?, ?, ?)',
    [MaLichTruc || null, LoaiHanhDong, MoTa, MaTaiKhoan || null]
  );
}

module.exports = {
  taoThongBao,
  thongBaoAdmins,
  getMaTaiKhoanBacSi,
  ghiLichSu
};
