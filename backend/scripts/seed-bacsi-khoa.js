/**
 * Seed: mỗi khoa 2 bác sĩ + phòng khám tương ứng.
 * Mật khẩu mặc định: 123456
 *
 * Chạy: npm run seed:bacsi
 *       node scripts/seed-bacsi-khoa.js
 */
require('../load-env');
const bcrypt = require('bcrypt');
const pool = require('../db');

const PASSWORD = '123456';
const TARGET_PER_KHOA = 2;

/** Mỗi khoa: 2 bác sĩ mẫu (username cố định để chạy lại an toàn) */
const KHOA_DOCTORS = [
  {
    khoa: 'Tim mạch',
    phong: { ten: 'Khoa Tim mạch', moTa: 'Khám và điều trị bệnh lý tim mạch' },
    bacsi: [
      { tenDangNhap: 'bs_tim1', hoTen: 'Nguyễn Văn An', code: 'BS_TIM1', sdt: '0909001001', email: 'an.tim@benhvien.vn' },
      { tenDangNhap: 'bs_tim2', hoTen: 'Phạm Minh Đức', code: 'BS_TIM2', sdt: '0909001002', email: 'duc.tim@benhvien.vn' }
    ]
  },
  {
    khoa: 'Nội khoa',
    phong: { ten: 'Khoa Nội', moTa: 'Nội khoa tổng quát' },
    bacsi: [
      { tenDangNhap: 'bs_noi1', hoTen: 'Trần Thị Bình', code: 'BS_NOI1', sdt: '0909002001', email: 'binh.noi@benhvien.vn' },
      { tenDangNhap: 'bs_noi2', hoTen: 'Hoàng Thị Lan', code: 'BS_NOI2', sdt: '0909002002', email: 'lan.noi@benhvien.vn' }
    ]
  },
  {
    khoa: 'Ngoại khoa',
    phong: { ten: 'Khoa Ngoại', moTa: 'Ngoại khoa tổng quát' },
    bacsi: [
      { tenDangNhap: 'bs_ngoai1', hoTen: 'Lê Văn Cường', code: 'BS_NGOAI1', sdt: '0909003001', email: 'cuong.ngoai@benhvien.vn' },
      { tenDangNhap: 'bs_ngoai2', hoTen: 'Vũ Quốc Bảo', code: 'BS_NGOAI2', sdt: '0909003002', email: 'bao.ngoai@benhvien.vn' }
    ]
  },
  {
    khoa: 'Nhi khoa',
    phong: { ten: 'Khoa Nhi', moTa: 'Khám và điều trị nhi khoa' },
    bacsi: [
      { tenDangNhap: 'bs_nhi1', hoTen: 'Đặng Thu Hà', code: 'BS_NHI1', sdt: '0909004001', email: 'ha.nhi@benhvien.vn' },
      { tenDangNhap: 'bs_nhi2', hoTen: 'Phan Văn Dũng', code: 'BS_NHI2', sdt: '0909004002', email: 'dung.nhi@benhvien.vn' }
    ]
  },
  {
    khoa: 'Sản phụ khoa',
    phong: { ten: 'Khoa Sản', moTa: 'Sản phụ khoa' },
    bacsi: [
      { tenDangNhap: 'bs_san1', hoTen: 'Ngô Thị Mai', code: 'BS_SAN1', sdt: '0909005001', email: 'mai.san@benhvien.vn' },
      { tenDangNhap: 'bs_san2', hoTen: 'Đỗ Thị Nga', code: 'BS_SAN2', sdt: '0909005002', email: 'nga.san@benhvien.vn' }
    ]
  },
  {
    khoa: 'Mắt',
    phong: { ten: 'Khoa Mắt', moTa: 'Khám mắt' },
    bacsi: [
      { tenDangNhap: 'bs_mat1', hoTen: 'Trịnh Văn Khoa', code: 'BS_MAT1', sdt: '0909006001', email: 'khoa.mat@benhvien.vn' },
      { tenDangNhap: 'bs_mat2', hoTen: 'Lưu Thị Oanh', code: 'BS_MAT2', sdt: '0909006002', email: 'oanh.mat@benhvien.vn' }
    ]
  },
  {
    khoa: 'Tai mũi họng',
    phong: { ten: 'Khoa Tai mũi họng', moTa: 'TMH' },
    bacsi: [
      { tenDangNhap: 'bs_tmh1', hoTen: 'Lý Thanh Tùng', code: 'BS_TMH1', sdt: '0909007001', email: 'tung.tmh@benhvien.vn' },
      { tenDangNhap: 'bs_tmh2', hoTen: 'Huỳnh Văn Phong', code: 'BS_TMH2', sdt: '0909007002', email: 'phong.tmh@benhvien.vn' }
    ]
  },
  {
    khoa: 'Da liễu',
    phong: { ten: 'Khoa Da liễu', moTa: 'Da liễu' },
    bacsi: [
      { tenDangNhap: 'bs_dalieu1', hoTen: 'Bùi Thị Hương', code: 'BS_DALIEU1', sdt: '0909008001', email: 'huong.dalieu@benhvien.vn' },
      { tenDangNhap: 'bs_dalieu2', hoTen: 'Cao Văn Sơn', code: 'BS_DALIEU2', sdt: '0909008002', email: 'son.dalieu@benhvien.vn' }
    ]
  },
  {
    khoa: 'Thần kinh',
    phong: { ten: 'Khoa Thần kinh', moTa: 'Thần kinh' },
    bacsi: [
      { tenDangNhap: 'bs_thankinh1', hoTen: 'Nguyễn Thị Lý', code: 'BS_TK1', sdt: '0909009001', email: 'ly.thankinh@benhvien.vn' },
      { tenDangNhap: 'bs_thankinh2', hoTen: 'Trần Quốc Huy', code: 'BS_TK2', sdt: '0909009002', email: 'huy.thankinh@benhvien.vn' }
    ]
  }
];

async function ensureRoom(room) {
  const [exist] = await pool.execute('SELECT MaPhong FROM PhongKham WHERE TenPhong = ? LIMIT 1', [room.ten]);
  if (exist.length) return;
  await pool.execute('INSERT INTO PhongKham (TenPhong, MoTa) VALUES (?, ?)', [room.ten, room.moTa]);
  console.log('✅ Phòng:', room.ten);
}

async function createDoctor(d, chuyenKhoa, hash) {
  const [existTk] = await pool.execute(
    'SELECT MaTaiKhoan FROM TaiKhoan WHERE TenDangNhap = ? LIMIT 1',
    [d.tenDangNhap]
  );
  if (existTk.length) {
    console.log('⏭  Đã có tài khoản:', d.tenDangNhap);
    return false;
  }

  const [tk] = await pool.execute(
    `INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
     VALUES (?, ?, 2, ?, ?, ?)`,
    [d.tenDangNhap, hash, d.hoTen, d.email, d.sdt]
  );

  let code = d.code;
  const [codeExist] = await pool.execute('SELECT MaBacSi FROM BacSi WHERE BacSiCode = ? LIMIT 1', [code]);
  if (codeExist.length) code = `${d.code}_${tk.insertId}`;

  await pool.execute(
    `INSERT INTO BacSi (MaTaiKhoan, HoTen, ChuyenKhoa, BacSiCode, SDT, Email)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tk.insertId, d.hoTen, chuyenKhoa, code, d.sdt, d.email]
  );
  console.log(`✅ ${d.tenDangNhap} — ${d.hoTen} (${chuyenKhoa})`);
  return true;
}

(async () => {
  const hash = await bcrypt.hash(PASSWORD, 10);
  console.log(`🔐 Mật khẩu mặc định: ${PASSWORD}`);
  console.log(`🎯 Mục tiêu: mỗi khoa ${TARGET_PER_KHOA} bác sĩ\n`);

  let created = 0;

  for (const group of KHOA_DOCTORS) {
    await ensureRoom(group.phong);

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) AS so FROM BacSi WHERE ChuyenKhoa = ?',
      [group.khoa]
    );
    const current = Number(countRows[0].so);
    const need = Math.max(0, TARGET_PER_KHOA - current);

    console.log(`\n🏥 ${group.khoa}: đang có ${current}, cần thêm ${need}`);

    if (need === 0) {
      console.log('   Đủ 2 bác sĩ — bỏ qua tạo mới');
      continue;
    }

    // Chỉ tạo các tài khoản chưa tồn tại, tối đa `need` bác sĩ
    let added = 0;
    for (const d of group.bacsi) {
      if (added >= need) break;
      const ok = await createDoctor(d, group.khoa, hash);
      if (ok) {
        added += 1;
        created += 1;
      }
    }

    // Nếu các username mẫu đã tồn tại nhưng khoa vẫn thiếu → tạo bác sĩ phụ với username suffix
    if (added < need) {
      for (let i = added; i < need; i += 1) {
        const n = current + i + 1;
        const slug = group.khoa
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '')
          .slice(0, 12);
        const d = {
          tenDangNhap: `bs_${slug}${n}`,
          hoTen: `Bác sĩ ${group.khoa} ${n}`,
          code: `BS_${slug.toUpperCase()}${n}`,
          sdt: `0909${String(100000 + n).slice(-6)}`,
          email: `${slug}${n}@benhvien.vn`
        };
        const ok = await createDoctor(d, group.khoa, hash);
        if (ok) created += 1;
      }
    }
  }

  const [summary] = await pool.execute(
    `SELECT bs.ChuyenKhoa,
            COUNT(*) AS soBacSi,
            GROUP_CONCAT(COALESCE(tk.TenDangNhap, '?') ORDER BY bs.MaBacSi SEPARATOR ', ') AS accounts
     FROM BacSi bs
     LEFT JOIN TaiKhoan tk ON bs.MaTaiKhoan = tk.MaTaiKhoan
     GROUP BY bs.ChuyenKhoa
     ORDER BY bs.ChuyenKhoa`
  );

  console.log(`\n✨ Đã tạo mới: ${created} bác sĩ`);
  console.log('\n📋 Tóm tắt theo khoa:');
  console.table(summary);
  console.log(`Mật khẩu đăng nhập: ${PASSWORD}`);
  process.exit(0);
})().catch((err) => {
  console.error('❌ Seed thất bại:', err.message);
  process.exit(1);
});
