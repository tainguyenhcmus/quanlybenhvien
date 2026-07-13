/**
 * Seed thêm tài khoản bác sĩ nhiều khoa + phòng khám tương ứng.
 * Mật khẩu mặc định: 123456
 *
 * Chạy: node scripts/seed-bacsi-khoa.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

const PASSWORD = '123456';

const DOCTORS = [
  { tenDangNhap: 'bacsi_tim2', hoTen: 'Phạm Minh Đức', chuyenKhoa: 'Tim mạch', code: 'BS010', sdt: '0909111010', email: 'duc.tim@benhvien.vn' },
  { tenDangNhap: 'bacsi_noi2', hoTen: 'Hoàng Thị Lan', chuyenKhoa: 'Nội khoa', code: 'BS011', sdt: '0909111011', email: 'lan.noi@benhvien.vn' },
  { tenDangNhap: 'bacsi_ngoai2', hoTen: 'Vũ Quốc Bảo', chuyenKhoa: 'Ngoại khoa', code: 'BS012', sdt: '0909111012', email: 'bao.ngoai@benhvien.vn' },
  { tenDangNhap: 'bacsi_nhi', hoTen: 'Đặng Thu Hà', chuyenKhoa: 'Nhi khoa', code: 'BS013', sdt: '0909111013', email: 'ha.nhi@benhvien.vn' },
  { tenDangNhap: 'bacsi_san', hoTen: 'Ngô Thị Mai', chuyenKhoa: 'Sản phụ khoa', code: 'BS014', sdt: '0909111014', email: 'mai.san@benhvien.vn' },
  { tenDangNhap: 'bacsi_mat', hoTen: 'Trịnh Văn Khoa', chuyenKhoa: 'Mắt', code: 'BS015', sdt: '0909111015', email: 'khoa.mat@benhvien.vn' },
  { tenDangNhap: 'bacsi_tmh', hoTen: 'Lý Thanh Tùng', chuyenKhoa: 'Tai mũi họng', code: 'BS016', sdt: '0909111016', email: 'tung.tmh@benhvien.vn' },
  { tenDangNhap: 'bacsi_dalieu', hoTen: 'Bùi Thị Hương', chuyenKhoa: 'Da liễu', code: 'BS017', sdt: '0909111017', email: 'huong.dalieu@benhvien.vn' },
  { tenDangNhap: 'bacsi_thankinh2', hoTen: 'Nguyễn Thị Lý', chuyenKhoa: 'Thần kinh', code: 'BS002', sdt: '0912382019', email: 'ly@gmail.com', linkExistingCode: true }
];

const ROOMS = [
  { ten: 'Khoa Tim mạch', moTa: 'Khám và điều trị bệnh lý tim mạch' },
  { ten: 'Khoa Nội', moTa: 'Nội khoa tổng quát' },
  { ten: 'Khoa Ngoại', moTa: 'Ngoại khoa tổng quát' },
  { ten: 'Khoa Nhi', moTa: 'Khám và điều trị nhi khoa' },
  { ten: 'Khoa Sản', moTa: 'Sản phụ khoa' },
  { ten: 'Khoa Mắt', moTa: 'Khám mắt' },
  { ten: 'Khoa Tai mũi họng', moTa: 'TMH' },
  { ten: 'Khoa Da liễu', moTa: 'Da liễu' },
  { ten: 'Khoa Thần kinh', moTa: 'Thần kinh' }
];

(async () => {
  const hash = await bcrypt.hash(PASSWORD, 10);
  console.log('🔐 Password hash sẵn sàng (mật khẩu:', PASSWORD + ')');

  for (const room of ROOMS) {
    const [exist] = await pool.execute('SELECT MaPhong FROM PhongKham WHERE TenPhong = ? LIMIT 1', [room.ten]);
    if (exist.length) {
      console.log('⏭  Phòng đã có:', room.ten);
      continue;
    }
    await pool.execute('INSERT INTO PhongKham (TenPhong, MoTa) VALUES (?, ?)', [room.ten, room.moTa]);
    console.log('✅ Thêm phòng:', room.ten);
  }

  for (const d of DOCTORS) {
    const [existTk] = await pool.execute(
      'SELECT MaTaiKhoan FROM TaiKhoan WHERE TenDangNhap = ? LIMIT 1',
      [d.tenDangNhap]
    );
    if (existTk.length) {
      console.log('⏭  Tài khoản đã có:', d.tenDangNhap);
      continue;
    }

    // Nếu đã có BacSi theo code nhưng chưa có tài khoản → chỉ gắn tài khoản
    if (d.linkExistingCode) {
      const [existBs] = await pool.execute(
        'SELECT MaBacSi, MaTaiKhoan FROM BacSi WHERE BacSiCode = ? LIMIT 1',
        [d.code]
      );
      if (existBs.length && !existBs[0].MaTaiKhoan) {
        const [tk] = await pool.execute(
          `INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
           VALUES (?, ?, 2, ?, ?, ?)`,
          [d.tenDangNhap, hash, d.hoTen, d.email, d.sdt]
        );
        await pool.execute('UPDATE BacSi SET MaTaiKhoan = ?, ChuyenKhoa = ? WHERE MaBacSi = ?', [
          tk.insertId,
          d.chuyenKhoa,
          existBs[0].MaBacSi
        ]);
        console.log(`✅ Gắn tài khoản ${d.tenDangNhap} → ${d.hoTen} (${d.chuyenKhoa})`);
        continue;
      }
      if (existBs.length && existBs[0].MaTaiKhoan) {
        console.log('⏭  Bác sĩ code đã có tài khoản:', d.code);
        continue;
      }
    }

    const [tk] = await pool.execute(
      `INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
       VALUES (?, ?, 2, ?, ?, ?)`,
      [d.tenDangNhap, hash, d.hoTen, d.email, d.sdt]
    );

    // Tránh trùng BacSiCode
    let code = d.code;
    const [codeExist] = await pool.execute('SELECT MaBacSi FROM BacSi WHERE BacSiCode = ? LIMIT 1', [code]);
    if (codeExist.length) code = `${d.code}_${tk.insertId}`;

    await pool.execute(
      `INSERT INTO BacSi (MaTaiKhoan, HoTen, ChuyenKhoa, BacSiCode, SDT, Email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tk.insertId, d.hoTen, d.chuyenKhoa, code, d.sdt, d.email]
    );
    console.log(`✅ Tạo ${d.tenDangNhap} — ${d.hoTen} (${d.chuyenKhoa})`);
  }

  const [list] = await pool.execute(
    `SELECT tk.TenDangNhap, bs.HoTen, bs.ChuyenKhoa, bs.BacSiCode
     FROM BacSi bs
     LEFT JOIN TaiKhoan tk ON bs.MaTaiKhoan = tk.MaTaiKhoan
     ORDER BY bs.ChuyenKhoa, bs.HoTen`
  );
  console.log('\n📋 Danh sách bác sĩ hiện tại:');
  console.table(list);
  console.log('Mật khẩu tất cả tài khoản mới: 123456');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Seed thất bại:', err.message);
  process.exit(1);
});
