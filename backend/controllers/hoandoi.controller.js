const pool = require('../db');
const { taoThongBao, thongBaoAdmins, getMaTaiKhoanBacSi, ghiLichSu } = require('../services/notify.service');

const BASE_QUERY = `
  SELECT yc.MaYeuCau, yc.LoaiYeuCau, yc.TrangThai, yc.GhiChu, yc.NgayTao,
         yc.MaLichTrucGui, yc.MaLichTrucNhan, yc.MaBacSiGui, yc.MaBacSiNhan,
         bsGui.HoTen AS TenBacSiGui, bsNhan.HoTen AS TenBacSiNhan,
         DATE_FORMAT(ltGui.NgayTruc, '%Y-%m-%d') AS NgayTrucGui, ltGui.CaTruc AS CaTrucGui, ltGui.TrangThai AS TrangThaiCaGui,
         pkGui.TenPhong AS TenPhongGui,
         DATE_FORMAT(ltNhan.NgayTruc, '%Y-%m-%d') AS NgayTrucNhan, ltNhan.CaTruc AS CaTrucNhan,
         pkNhan.TenPhong AS TenPhongNhan
  FROM YeuCauHoanDoiCa yc
  LEFT JOIN BacSi bsGui ON yc.MaBacSiGui = bsGui.MaBacSi
  LEFT JOIN BacSi bsNhan ON yc.MaBacSiNhan = bsNhan.MaBacSi
  LEFT JOIN LichTruc ltGui ON yc.MaLichTrucGui = ltGui.MaLichTruc
  LEFT JOIN PhongKham pkGui ON ltGui.MaPhong = pkGui.MaPhong
  LEFT JOIN LichTruc ltNhan ON yc.MaLichTrucNhan = ltNhan.MaLichTruc
  LEFT JOIN PhongKham pkNhan ON ltNhan.MaPhong = pkNhan.MaPhong
`;

async function layTatCa(req, res) {
  try {
    const [rows] = await pool.execute(`${BASE_QUERY} ORDER BY yc.NgayTao DESC`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching swap requests:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function layTheoBacSi(req, res) {
  const maBacSi = req.maBacSi;
  try {
    const [rows] = await pool.execute(
      `${BASE_QUERY} WHERE yc.MaBacSiGui = ? OR yc.MaBacSiNhan = ? ORDER BY yc.NgayTao DESC`,
      [maBacSi, maBacSi]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching doctor swap requests:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function kiemTraCaHopLe(maLichTruc, maBacSi) {
  const [rows] = await pool.execute(
    `SELECT MaLichTruc, MaBacSi, NgayTruc, TrangThai FROM LichTruc
     WHERE MaLichTruc = ? AND MaBacSi = ? AND TrangThai = 'Đã duyệt' AND NgayTruc >= CURDATE()`,
    [maLichTruc, maBacSi]
  );
  return rows[0] || null;
}

async function kiemTraYeuCauDangCho(maLichTruc) {
  const [rows] = await pool.execute(
    `SELECT MaYeuCau FROM YeuCauHoanDoiCa
     WHERE (MaLichTrucGui = ? OR MaLichTrucNhan = ?)
       AND TrangThai IN ('Chờ xác nhận', 'Chờ duyệt')`,
    [maLichTruc, maLichTruc]
  );
  return rows.length > 0;
}

async function kiemTraCungKhoa(maBacSiGui, maBacSiNhan) {
  const [rows] = await pool.execute(
    `SELECT bs1.ChuyenKhoa AS khoaGui, bs2.ChuyenKhoa AS khoaNhan
     FROM BacSi bs1
     JOIN BacSi bs2 ON bs2.MaBacSi = ?
     WHERE bs1.MaBacSi = ?`,
    [maBacSiNhan, maBacSiGui]
  );
  if (!rows.length) return false;
  const { khoaGui, khoaNhan } = rows[0];
  return Boolean(khoaGui && khoaNhan && khoaGui === khoaNhan);
}

/** true nếu bác sĩ đã có ca cùng ngày+ca (trừ ca exclude) */
async function coXungDotCa(db, maBacSi, ngayTruc, caTruc, excludeMaLichTruc = null) {
  const [rows] = await db.execute(
    `SELECT MaLichTruc FROM LichTruc
     WHERE MaBacSi = ? AND NgayTruc = ? AND CaTruc = ?
       AND TrangThai IN ('Đã duyệt', 'Chờ duyệt')
       AND (? IS NULL OR MaLichTruc != ?)`,
    [maBacSi, ngayTruc, caTruc, excludeMaLichTruc, excludeMaLichTruc]
  );
  return rows.length > 0;
}

async function taoYeuCau(req, res) {
  const { LoaiYeuCau, MaLichTrucGui, MaLichTrucNhan, MaBacSiNhan, GhiChu } = req.body;
  const maBacSiGui = req.maBacSi;

  if (!LoaiYeuCau || !MaLichTrucGui || !MaBacSiNhan) {
    return res.status(400).json({ message: 'Thiếu thông tin yêu cầu' });
  }
  if (!['Nhuong', 'HoanDoi'].includes(LoaiYeuCau)) {
    return res.status(400).json({ message: 'Loại yêu cầu không hợp lệ' });
  }
  if (maBacSiGui === parseInt(MaBacSiNhan)) {
    return res.status(400).json({ message: 'Không thể gửi yêu cầu cho chính mình' });
  }

  try {
    if (!(await kiemTraCungKhoa(maBacSiGui, parseInt(MaBacSiNhan)))) {
      return res.status(400).json({ message: 'Chỉ có thể nhượng/hoán đổi ca với bác sĩ cùng khoa' });
    }

    const caGui = await kiemTraCaHopLe(parseInt(MaLichTrucGui), maBacSiGui);
    if (!caGui) {
      return res.status(400).json({ message: 'Ca trực gửi không hợp lệ hoặc chưa được duyệt' });
    }
    if (await kiemTraYeuCauDangCho(parseInt(MaLichTrucGui))) {
      return res.status(400).json({ message: 'Ca trực này đang có yêu cầu hoán đổi/nhượng chờ xử lý' });
    }

    if (LoaiYeuCau === 'Nhuong') {
      if (await coXungDotCa(pool, parseInt(MaBacSiNhan), caGui.NgayTruc, caGui.CaTruc)) {
        return res.status(400).json({
          message: 'Bác sĩ nhận đã có ca trực cùng ngày và cùng ca — không thể nhượng'
        });
      }
    }

    if (LoaiYeuCau === 'HoanDoi') {
      if (!MaLichTrucNhan) {
        return res.status(400).json({ message: 'Thiếu ca trực để hoán đổi' });
      }
      const caNhan = await kiemTraCaHopLe(parseInt(MaLichTrucNhan), parseInt(MaBacSiNhan));
      if (!caNhan) {
        return res.status(400).json({ message: 'Ca trực nhận không hợp lệ hoặc chưa được duyệt' });
      }
      if (await kiemTraYeuCauDangCho(parseInt(MaLichTrucNhan))) {
        return res.status(400).json({ message: 'Ca trực đối tác đang có yêu cầu chờ xử lý' });
      }
      // Sau hoán đổi: bác sĩ nhận nhận ca gửi (trừ ca họ đang nhường đi)
      if (await coXungDotCa(pool, parseInt(MaBacSiNhan), caGui.NgayTruc, caGui.CaTruc, parseInt(MaLichTrucNhan))) {
        return res.status(400).json({
          message: 'Bác sĩ đối tác đã có ca trùng với ca bạn muốn hoán đổi'
        });
      }
      if (await coXungDotCa(pool, maBacSiGui, caNhan.NgayTruc, caNhan.CaTruc, parseInt(MaLichTrucGui))) {
        return res.status(400).json({
          message: 'Bạn đã có ca trùng với ca đối tác muốn hoán đổi'
        });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO YeuCauHoanDoiCa (LoaiYeuCau, MaLichTrucGui, MaLichTrucNhan, MaBacSiGui, MaBacSiNhan, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        LoaiYeuCau,
        parseInt(MaLichTrucGui),
        LoaiYeuCau === 'HoanDoi' ? parseInt(MaLichTrucNhan) : null,
        maBacSiGui,
        parseInt(MaBacSiNhan),
        GhiChu || null
      ]
    );

    const loaiLabel = LoaiYeuCau === 'Nhuong' ? 'nhượng ca' : 'hoán đổi ca';
    await ghiLichSu({
      MaLichTruc: parseInt(MaLichTrucGui),
      LoaiHanhDong: LoaiYeuCau === 'Nhuong' ? 'YeuCauNhuong' : 'YeuCauHoanDoi',
      MoTa: `Gửi yêu cầu ${loaiLabel} #${result.insertId}`,
      MaTaiKhoan: req.user?.MaTaiKhoan
    });

    const maTkNhan = await getMaTaiKhoanBacSi(parseInt(MaBacSiNhan));
    if (maTkNhan) {
      await taoThongBao({
        MaTaiKhoan: maTkNhan,
        TieuDe: `Yêu cầu ${loaiLabel} mới`,
        NoiDung: `Bạn có yêu cầu ${loaiLabel} cần xác nhận`,
        Loai: 'HoanDoi',
        MaLienKet: result.insertId
      });
    }

    res.json({ message: 'Đã gửi yêu cầu, chờ bác sĩ đối tác xác nhận', id: result.insertId });
  } catch (err) {
    console.error('Error creating swap request:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function xacNhan(req, res) {
  const id = parseInt(req.params.id);
  const maBacSi = req.maBacSi;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM YeuCauHoanDoiCa WHERE MaYeuCau = ? AND MaBacSiNhan = ? AND TrangThai = ?',
      [id, maBacSi, 'Chờ xác nhận']
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoặc bạn không có quyền xác nhận' });
    }

    await pool.execute(
      'UPDATE YeuCauHoanDoiCa SET TrangThai = ? WHERE MaYeuCau = ?',
      ['Chờ duyệt', id]
    );

    const yc = rows[0];
    await ghiLichSu({
      MaLichTruc: yc.MaLichTrucGui,
      LoaiHanhDong: 'XacNhanHoanDoi',
      MoTa: `Bác sĩ nhận xác nhận yêu cầu #${id}, chờ admin duyệt`,
      MaTaiKhoan: req.user?.MaTaiKhoan
    });

    const maTkGui = await getMaTaiKhoanBacSi(yc.MaBacSiGui);
    if (maTkGui) {
      await taoThongBao({
        MaTaiKhoan: maTkGui,
        TieuDe: 'Đối tác đã xác nhận yêu cầu',
        NoiDung: `Yêu cầu #${id} đã được xác nhận, chờ quản trị viên duyệt`,
        Loai: 'HoanDoi',
        MaLienKet: id
      });
    }
    await thongBaoAdmins({
      TieuDe: 'Yêu cầu hoán đổi/nhượng ca chờ duyệt',
      NoiDung: `Yêu cầu #${id} đã được cả hai bác sĩ thống nhất, cần admin duyệt`,
      Loai: 'HoanDoi',
      MaLienKet: id
    });

    res.json({ message: 'Đã xác nhận yêu cầu, chờ quản trị viên duyệt' });
  } catch (err) {
    console.error('Error confirming swap request:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function tuChoi(req, res) {
  const id = parseInt(req.params.id);
  const maBacSi = req.maBacSi;

  try {
    const [rows] = await pool.execute(
      `SELECT * FROM YeuCauHoanDoiCa WHERE MaYeuCau = ?
       AND (MaBacSiNhan = ? OR MaBacSiGui = ?)
       AND TrangThai IN ('Chờ xác nhận', 'Chờ duyệt')`,
      [id, maBacSi, maBacSi]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoặc không thể từ chối' });
    }
    const yc = rows[0];
    if (yc.TrangThai === 'Chờ duyệt' && yc.MaBacSiGui !== maBacSi) {
      return res.status(403).json({ message: 'Chỉ người gửi mới có thể hủy yêu cầu đang chờ duyệt' });
    }

    await pool.execute('UPDATE YeuCauHoanDoiCa SET TrangThai = ? WHERE MaYeuCau = ?', ['Từ chối', id]);

    await ghiLichSu({
      MaLichTruc: yc.MaLichTrucGui,
      LoaiHanhDong: 'TuChoiHoanDoi',
      MoTa: `Từ chối yêu cầu hoán đổi/nhượng #${id}`,
      MaTaiKhoan: req.user?.MaTaiKhoan
    });

    const otherBacSi = yc.MaBacSiNhan === maBacSi ? yc.MaBacSiGui : yc.MaBacSiNhan;
    const maTkOther = await getMaTaiKhoanBacSi(otherBacSi);
    if (maTkOther) {
      await taoThongBao({
        MaTaiKhoan: maTkOther,
        TieuDe: 'Yêu cầu hoán đổi/nhượng bị từ chối',
        NoiDung: `Yêu cầu #${id} đã bị từ chối`,
        Loai: 'HoanDoi',
        MaLienKet: id
      });
    }

    res.json({ message: 'Đã từ chối/hủy yêu cầu' });
  } catch (err) {
    console.error('Error rejecting swap request:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function huyYeuCau(req, res) {
  const id = parseInt(req.params.id);
  const maBacSi = req.maBacSi;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM YeuCauHoanDoiCa WHERE MaYeuCau = ? AND MaBacSiGui = ? AND TrangThai = ?',
      [id, maBacSi, 'Chờ xác nhận']
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoặc không thể hủy' });
    }

    await pool.execute('UPDATE YeuCauHoanDoiCa SET TrangThai = ? WHERE MaYeuCau = ?', ['Hủy', id]);

    const yc = rows[0];
    await ghiLichSu({
      MaLichTruc: yc.MaLichTrucGui,
      LoaiHanhDong: 'HuyHoanDoi',
      MoTa: `Hủy yêu cầu hoán đổi/nhượng #${id}`,
      MaTaiKhoan: req.user?.MaTaiKhoan
    });

    const maTkNhan = await getMaTaiKhoanBacSi(yc.MaBacSiNhan);
    if (maTkNhan) {
      await taoThongBao({
        MaTaiKhoan: maTkNhan,
        TieuDe: 'Yêu cầu hoán đổi/nhượng đã bị hủy',
        NoiDung: `Người gửi đã hủy yêu cầu #${id}`,
        Loai: 'HoanDoi',
        MaLienKet: id
      });
    }

    res.json({ message: 'Đã hủy yêu cầu' });
  } catch (err) {
    console.error('Error cancelling swap request:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

async function duyetYeuCau(req, res) {
  const id = parseInt(req.params.id);
  const { TrangThai } = req.body;

  if (!['Đã duyệt', 'Từ chối'].includes(TrangThai)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT * FROM YeuCauHoanDoiCa WHERE MaYeuCau = ? AND TrangThai = ? FOR UPDATE',
      [id, 'Chờ duyệt']
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu đang chờ duyệt' });
    }

    const yc = rows[0];

    if (TrangThai === 'Từ chối') {
      await connection.execute('UPDATE YeuCauHoanDoiCa SET TrangThai = ? WHERE MaYeuCau = ?', ['Từ chối', id]);
      await ghiLichSu({
        MaLichTruc: yc.MaLichTrucGui,
        LoaiHanhDong: 'AdminTuChoiHoanDoi',
        MoTa: `Admin từ chối yêu cầu #${id}`,
        MaTaiKhoan: req.user?.MaTaiKhoan
      }, connection);
      await connection.commit();

      for (const maBs of [yc.MaBacSiGui, yc.MaBacSiNhan]) {
        const maTk = await getMaTaiKhoanBacSi(maBs);
        if (maTk) {
          await taoThongBao({
            MaTaiKhoan: maTk,
            TieuDe: 'Admin từ chối yêu cầu hoán đổi/nhượng',
            NoiDung: `Yêu cầu #${id} đã bị quản trị viên từ chối`,
            Loai: 'HoanDoi',
            MaLienKet: id
          });
        }
      }
      return res.json({ message: 'Đã từ chối yêu cầu' });
    }

    const [caGuiRows] = await connection.execute(
      'SELECT MaLichTruc, MaBacSi, NgayTruc, CaTruc FROM LichTruc WHERE MaLichTruc = ? FOR UPDATE',
      [yc.MaLichTrucGui]
    );
    const caGui = caGuiRows[0];
    if (!caGui) {
      await connection.rollback();
      return res.status(400).json({ message: 'Ca trực gửi không còn tồn tại' });
    }

    if (yc.LoaiYeuCau === 'Nhuong') {
      if (await coXungDotCa(connection, yc.MaBacSiNhan, caGui.NgayTruc, caGui.CaTruc, yc.MaLichTrucGui)) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Không thể duyệt: bác sĩ nhận đã có ca trực cùng ngày và cùng ca'
        });
      }
      await connection.execute(
        'UPDATE LichTruc SET MaBacSi = ? WHERE MaLichTruc = ?',
        [yc.MaBacSiNhan, yc.MaLichTrucGui]
      );
    } else {
      const [caNhanRows] = await connection.execute(
        'SELECT MaLichTruc, MaBacSi, NgayTruc, CaTruc FROM LichTruc WHERE MaLichTruc = ? FOR UPDATE',
        [yc.MaLichTrucNhan]
      );
      const caNhan = caNhanRows[0];
      if (!caNhan) {
        await connection.rollback();
        return res.status(400).json({ message: 'Ca trực đối tác không còn tồn tại' });
      }

      if (await coXungDotCa(connection, yc.MaBacSiNhan, caGui.NgayTruc, caGui.CaTruc, yc.MaLichTrucNhan)) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Không thể duyệt: bác sĩ nhận đã có ca trùng với ca gửi'
        });
      }
      if (await coXungDotCa(connection, yc.MaBacSiGui, caNhan.NgayTruc, caNhan.CaTruc, yc.MaLichTrucGui)) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Không thể duyệt: bác sĩ gửi đã có ca trùng với ca đối tác'
        });
      }

      // Hoán đổi 3 bước để tránh trùng unique (MaBacSi, NgayTruc, CaTruc)
      const tmpCa = `__SWAP_${yc.MaLichTrucGui}`;
      await connection.execute(
        'UPDATE LichTruc SET CaTruc = ? WHERE MaLichTruc = ?',
        [tmpCa, yc.MaLichTrucGui]
      );
      await connection.execute(
        'UPDATE LichTruc SET MaBacSi = ? WHERE MaLichTruc = ?',
        [yc.MaBacSiGui, yc.MaLichTrucNhan]
      );
      await connection.execute(
        'UPDATE LichTruc SET MaBacSi = ?, CaTruc = ? WHERE MaLichTruc = ?',
        [yc.MaBacSiNhan, caGui.CaTruc, yc.MaLichTrucGui]
      );
    }

    await connection.execute('UPDATE YeuCauHoanDoiCa SET TrangThai = ? WHERE MaYeuCau = ?', ['Đã duyệt', id]);

    const loaiLabel = yc.LoaiYeuCau === 'Nhuong' ? 'nhượng ca' : 'hoán đổi ca';
    await ghiLichSu({
      MaLichTruc: yc.MaLichTrucGui,
      LoaiHanhDong: yc.LoaiYeuCau === 'Nhuong' ? 'DuyetNhuong' : 'DuyetHoanDoi',
      MoTa: `Admin duyệt ${loaiLabel} #${id}`,
      MaTaiKhoan: req.user?.MaTaiKhoan
    }, connection);
    if (yc.MaLichTrucNhan) {
      await ghiLichSu({
        MaLichTruc: yc.MaLichTrucNhan,
        LoaiHanhDong: 'DuyetHoanDoi',
        MoTa: `Admin duyệt hoán đổi #${id} (ca đối tác)`,
        MaTaiKhoan: req.user?.MaTaiKhoan
      }, connection);
    }

    await connection.commit();

    for (const maBs of [yc.MaBacSiGui, yc.MaBacSiNhan]) {
      const maTk = await getMaTaiKhoanBacSi(maBs);
      if (maTk) {
        await taoThongBao({
          MaTaiKhoan: maTk,
          TieuDe: `Admin đã duyệt ${loaiLabel}`,
          NoiDung: `Yêu cầu #${id} đã được duyệt thành công`,
          Loai: 'HoanDoi',
          MaLienKet: id
        });
      }
    }

    res.json({ message: 'Đã duyệt yêu cầu hoán đổi/nhượng ca thành công' });
  } catch (err) {
    await connection.rollback();
    console.error('Error approving swap request:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: 'Không thể duyệt: bác sĩ đã có ca trực trùng ngày và ca'
      });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  } finally {
    connection.release();
  }
}

module.exports = {
  layTatCa,
  layTheoBacSi,
  taoYeuCau,
  xacNhan,
  tuChoi,
  huyYeuCau,
  duyetYeuCau
};
