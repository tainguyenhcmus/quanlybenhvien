const pool = require('../db');
const { taoThongBao, thongBaoAdmins, getMaTaiKhoanBacSi, ghiLichSu } = require('../services/notify.service');

const BASE_QUERY = `
  SELECT lt.MaLichTruc, DATE_FORMAT(lt.NgayTruc, '%Y-%m-%d') AS NgayTruc, lt.CaTruc, lt.TrangThai, lt.GhiChu, lt.NgayTao,
         bs.MaBacSi, bs.HoTen AS TenBacSi, bs.ChuyenKhoa,
         pk.MaPhong, pk.TenPhong
  FROM LichTruc lt
  LEFT JOIN BacSi bs ON lt.MaBacSi = bs.MaBacSi
  LEFT JOIN PhongKham pk ON lt.MaPhong = pk.MaPhong
`;

async function layTatCaLichTruc(req, res) {
  try {
    const [rows] = await pool.execute(`${BASE_QUERY} ORDER BY lt.NgayTruc DESC, lt.CaTruc`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching on-call schedules:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function layLichTrucTheoBacSi(req, res) {
  const maBacSi = parseInt(req.params.maBacSi);
  if (!maBacSi) return res.status(400).json({ message: 'Mã bác sĩ không hợp lệ' });

  try {
    const [rows] = await pool.execute(
      `${BASE_QUERY} WHERE lt.MaBacSi = ? ORDER BY lt.NgayTruc DESC, lt.CaTruc`,
      [maBacSi]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching doctor on-call schedules:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function themLichTruc(req, res) {
  const { MaBacSi, MaPhong, NgayTruc, CaTruc, TrangThai, GhiChu } = req.body;
  if (!MaBacSi || !NgayTruc || !CaTruc) {
    return res.status(400).json({ message: 'Thiếu thông tin lịch trực (bác sĩ, ngày, ca trực)' });
  }

  const validCa = ['Sáng', 'Chiều', 'Đêm'];
  if (!validCa.includes(CaTruc)) {
    return res.status(400).json({ message: 'Ca trực không hợp lệ. Chọn: Sáng, Chiều, Đêm' });
  }

  try {
    const trangThai = TrangThai || 'Chờ duyệt';
    const [result] = await pool.execute(
      'INSERT INTO LichTruc (MaBacSi, MaPhong, NgayTruc, CaTruc, TrangThai, GhiChu) VALUES (?, ?, ?, ?, ?, ?)',
      [MaBacSi, MaPhong || null, NgayTruc, CaTruc, trangThai, GhiChu || null]
    );
    const id = result.insertId;
    const actor = req.user?.MaTaiKhoan;

    await ghiLichSu({
      MaLichTruc: id,
      LoaiHanhDong: trangThai === 'Đã duyệt' ? 'TaoMoi' : 'DangKy',
      MoTa: trangThai === 'Đã duyệt'
        ? `Admin tạo lịch trực ${NgayTruc} ca ${CaTruc}`
        : `Bác sĩ đăng ký ca trực ${NgayTruc} ca ${CaTruc} (chờ duyệt)`,
      MaTaiKhoan: actor
    });

    if (trangThai === 'Chờ duyệt') {
      await thongBaoAdmins({
        TieuDe: 'Đăng ký ca trực mới',
        NoiDung: `Có đăng ký ca trực ngày ${NgayTruc} - ${CaTruc} cần duyệt`,
        Loai: 'LichTruc',
        MaLienKet: id
      });
    } else {
      const maTkBs = await getMaTaiKhoanBacSi(MaBacSi);
      if (maTkBs) {
        await taoThongBao({
          MaTaiKhoan: maTkBs,
          TieuDe: 'Được xếp lịch trực',
          NoiDung: `Bạn được xếp trực ngày ${NgayTruc} - ca ${CaTruc}`,
          Loai: 'LichTruc',
          MaLienKet: id
        });
      }
    }

    res.json({ message: 'Thêm lịch trực thành công', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Bác sĩ đã có ca trực này trong ngày đã chọn' });
    }
    console.error('Error creating on-call schedule:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function capNhatLichTruc(req, res) {
  const id = parseInt(req.params.id);
  const { MaBacSi, MaPhong, NgayTruc, CaTruc, TrangThai, GhiChu } = req.body;
  if (!id) return res.status(400).json({ message: 'Id lịch trực không hợp lệ' });

  try {
    await pool.execute(
      `UPDATE LichTruc SET MaBacSi = ?, MaPhong = ?, NgayTruc = ?, CaTruc = ?, TrangThai = ?, GhiChu = ?
       WHERE MaLichTruc = ?`,
      [MaBacSi, MaPhong || null, NgayTruc, CaTruc, TrangThai, GhiChu || null, id]
    );

    await ghiLichSu({
      MaLichTruc: id,
      LoaiHanhDong: 'CapNhat',
      MoTa: `Cập nhật lịch trực: ${NgayTruc} ca ${CaTruc}, trạng thái ${TrangThai}`,
      MaTaiKhoan: req.user?.MaTaiKhoan
    });

    const maTkBs = await getMaTaiKhoanBacSi(MaBacSi);
    if (maTkBs) {
      await taoThongBao({
        MaTaiKhoan: maTkBs,
        TieuDe: 'Lịch trực được cập nhật',
        NoiDung: `Ca trực ${NgayTruc} - ${CaTruc} đã được admin cập nhật`,
        Loai: 'LichTruc',
        MaLienKet: id
      });
    }

    res.json({ message: 'Cập nhật lịch trực thành công' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Bác sĩ đã có ca trực này trong ngày đã chọn' });
    }
    console.error('Error updating on-call schedule:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function capNhatTrangThai(req, res) {
  const id = parseInt(req.params.id);
  const { TrangThai } = req.body;
  if (!id || !TrangThai) return res.status(400).json({ message: 'Thiếu thông tin' });

  const validStatus = ['Chờ duyệt', 'Đã duyệt', 'Từ chối'];
  if (!validStatus.includes(TrangThai)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT lt.MaBacSi, DATE_FORMAT(lt.NgayTruc, '%Y-%m-%d') AS NgayTruc, lt.CaTruc
       FROM LichTruc lt WHERE lt.MaLichTruc = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy lịch trực' });

    await pool.execute('UPDATE LichTruc SET TrangThai = ? WHERE MaLichTruc = ?', [TrangThai, id]);

    const ca = rows[0];
    await ghiLichSu({
      MaLichTruc: id,
      LoaiHanhDong: TrangThai === 'Đã duyệt' ? 'Duyet' : TrangThai === 'Từ chối' ? 'TuChoi' : 'CapNhat',
      MoTa: `Admin đổi trạng thái ca ${ca.NgayTruc} - ${ca.CaTruc} thành "${TrangThai}"`,
      MaTaiKhoan: req.user?.MaTaiKhoan
    });

    const maTkBs = await getMaTaiKhoanBacSi(ca.MaBacSi);
    if (maTkBs) {
      await taoThongBao({
        MaTaiKhoan: maTkBs,
        TieuDe: TrangThai === 'Đã duyệt' ? 'Ca trực đã được duyệt' : 'Ca trực bị từ chối',
        NoiDung: `Ca trực ${ca.NgayTruc} - ${ca.CaTruc}: ${TrangThai}`,
        Loai: 'LichTruc',
        MaLienKet: id
      });
    }

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error('Error updating on-call status:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function xoaLichTruc(req, res) {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'Id lịch trực không hợp lệ' });

  try {
    const [rows] = await pool.execute(
      `SELECT MaBacSi, DATE_FORMAT(NgayTruc, '%Y-%m-%d') AS NgayTruc, CaTruc FROM LichTruc WHERE MaLichTruc = ?`,
      [id]
    );
    const ca = rows[0];

    await ghiLichSu({
      MaLichTruc: id,
      LoaiHanhDong: 'Xoa',
      MoTa: ca
        ? `Xóa lịch trực ${ca.NgayTruc} - ${ca.CaTruc}`
        : `Xóa lịch trực #${id}`,
      MaTaiKhoan: req.user?.MaTaiKhoan
    });

    await pool.execute('DELETE FROM LichTruc WHERE MaLichTruc = ?', [id]);

    if (ca) {
      const maTkBs = await getMaTaiKhoanBacSi(ca.MaBacSi);
      if (maTkBs && maTkBs !== req.user?.MaTaiKhoan) {
        await taoThongBao({
          MaTaiKhoan: maTkBs,
          TieuDe: 'Ca trực đã bị hủy',
          NoiDung: `Ca trực ${ca.NgayTruc} - ${ca.CaTruc} đã bị xóa/hủy`,
          Loai: 'LichTruc',
          MaLienKet: null
        });
      }
    }

    res.json({ message: 'Xóa lịch trực thành công' });
  } catch (err) {
    console.error('Error deleting on-call schedule:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = {
  layTatCaLichTruc,
  layLichTrucTheoBacSi,
  themLichTruc,
  capNhatLichTruc,
  capNhatTrangThai,
  xoaLichTruc
};
