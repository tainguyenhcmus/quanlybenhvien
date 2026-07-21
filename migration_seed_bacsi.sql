-- Seed: mỗi khoa 2 bác sĩ + phòng khám
-- Mật khẩu tất cả: 123456
-- Chạy an toàn nhiều lần (bỏ qua nếu TenDangNhap / TenPhong đã tồn tại)
-- Lưu ý: đổi tên DB nếu server khác QuanLyBenhVien

USE QuanLyBenhVien;

-- ===============================
-- PHÒNG KHÁM
-- ===============================
INSERT INTO PhongKham (TenPhong, MoTa)
SELECT * FROM (
  SELECT 'Khoa Tim mạch' AS TenPhong, 'Khám và điều trị bệnh lý tim mạch' AS MoTa UNION ALL
  SELECT 'Khoa Nội', 'Nội khoa tổng quát' UNION ALL
  SELECT 'Khoa Ngoại', 'Ngoại khoa tổng quát' UNION ALL
  SELECT 'Khoa Nhi', 'Khám và điều trị nhi khoa' UNION ALL
  SELECT 'Khoa Sản', 'Sản phụ khoa' UNION ALL
  SELECT 'Khoa Mắt', 'Khám mắt' UNION ALL
  SELECT 'Khoa Tai mũi họng', 'TMH' UNION ALL
  SELECT 'Khoa Da liễu', 'Da liễu' UNION ALL
  SELECT 'Khoa Thần kinh', 'Thần kinh'
) AS r
WHERE NOT EXISTS (SELECT 1 FROM PhongKham p WHERE p.TenPhong = r.TenPhong);

-- Hash bcrypt của "123456"
SET @pwd := '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu';

-- ===============================
-- TÀI KHOẢN BÁC SĨ (MaChucVu = 2)
-- ===============================
INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
SELECT v.TenDangNhap, @pwd, 2, v.HoTen, v.Email, v.DienThoai
FROM (
  SELECT 'bs_tim1' AS TenDangNhap, 'Nguyễn Văn An' AS HoTen, 'an.tim@benhvien.vn' AS Email, '0909001001' AS DienThoai UNION ALL
  SELECT 'bs_tim2', 'Phạm Minh Đức', 'duc.tim@benhvien.vn', '0909001002' UNION ALL
  SELECT 'bs_noi1', 'Trần Thị Bình', 'binh.noi@benhvien.vn', '0909002001' UNION ALL
  SELECT 'bs_noi2', 'Hoàng Thị Lan', 'lan.noi@benhvien.vn', '0909002002' UNION ALL
  SELECT 'bs_ngoai1', 'Lê Văn Cường', 'cuong.ngoai@benhvien.vn', '0909003001' UNION ALL
  SELECT 'bs_ngoai2', 'Vũ Quốc Bảo', 'bao.ngoai@benhvien.vn', '0909003002' UNION ALL
  SELECT 'bs_nhi1', 'Đặng Thu Hà', 'ha.nhi@benhvien.vn', '0909004001' UNION ALL
  SELECT 'bs_nhi2', 'Phan Văn Dũng', 'dung.nhi@benhvien.vn', '0909004002' UNION ALL
  SELECT 'bs_san1', 'Ngô Thị Mai', 'mai.san@benhvien.vn', '0909005001' UNION ALL
  SELECT 'bs_san2', 'Đỗ Thị Nga', 'nga.san@benhvien.vn', '0909005002' UNION ALL
  SELECT 'bs_mat1', 'Trịnh Văn Khoa', 'khoa.mat@benhvien.vn', '0909006001' UNION ALL
  SELECT 'bs_mat2', 'Lưu Thị Oanh', 'oanh.mat@benhvien.vn', '0909006002' UNION ALL
  SELECT 'bs_tmh1', 'Lý Thanh Tùng', 'tung.tmh@benhvien.vn', '0909007001' UNION ALL
  SELECT 'bs_tmh2', 'Huỳnh Văn Phong', 'phong.tmh@benhvien.vn', '0909007002' UNION ALL
  SELECT 'bs_dalieu1', 'Bùi Thị Hương', 'huong.dalieu@benhvien.vn', '0909008001' UNION ALL
  SELECT 'bs_dalieu2', 'Cao Văn Sơn', 'son.dalieu@benhvien.vn', '0909008002' UNION ALL
  SELECT 'bs_thankinh1', 'Nguyễn Thị Lý', 'ly.thankinh@benhvien.vn', '0909009001' UNION ALL
  SELECT 'bs_thankinh2', 'Trần Quốc Huy', 'huy.thankinh@benhvien.vn', '0909009002'
) AS v
WHERE NOT EXISTS (
  SELECT 1 FROM TaiKhoan tk WHERE tk.TenDangNhap = v.TenDangNhap
);

-- ===============================
-- BẢNG BacSi (liên kết theo TenDangNhap)
-- ===============================
INSERT INTO BacSi (MaTaiKhoan, HoTen, ChuyenKhoa, BacSiCode, SDT, Email)
SELECT tk.MaTaiKhoan, v.HoTen, v.ChuyenKhoa, v.BacSiCode, v.SDT, v.Email
FROM (
  SELECT 'bs_tim1' AS TenDangNhap, 'Nguyễn Văn An' AS HoTen, 'Tim mạch' AS ChuyenKhoa, 'BS_TIM1' AS BacSiCode, '0909001001' AS SDT, 'an.tim@benhvien.vn' AS Email UNION ALL
  SELECT 'bs_tim2', 'Phạm Minh Đức', 'Tim mạch', 'BS_TIM2', '0909001002', 'duc.tim@benhvien.vn' UNION ALL
  SELECT 'bs_noi1', 'Trần Thị Bình', 'Nội khoa', 'BS_NOI1', '0909002001', 'binh.noi@benhvien.vn' UNION ALL
  SELECT 'bs_noi2', 'Hoàng Thị Lan', 'Nội khoa', 'BS_NOI2', '0909002002', 'lan.noi@benhvien.vn' UNION ALL
  SELECT 'bs_ngoai1', 'Lê Văn Cường', 'Ngoại khoa', 'BS_NGOAI1', '0909003001', 'cuong.ngoai@benhvien.vn' UNION ALL
  SELECT 'bs_ngoai2', 'Vũ Quốc Bảo', 'Ngoại khoa', 'BS_NGOAI2', '0909003002', 'bao.ngoai@benhvien.vn' UNION ALL
  SELECT 'bs_nhi1', 'Đặng Thu Hà', 'Nhi khoa', 'BS_NHI1', '0909004001', 'ha.nhi@benhvien.vn' UNION ALL
  SELECT 'bs_nhi2', 'Phan Văn Dũng', 'Nhi khoa', 'BS_NHI2', '0909004002', 'dung.nhi@benhvien.vn' UNION ALL
  SELECT 'bs_san1', 'Ngô Thị Mai', 'Sản phụ khoa', 'BS_SAN1', '0909005001', 'mai.san@benhvien.vn' UNION ALL
  SELECT 'bs_san2', 'Đỗ Thị Nga', 'Sản phụ khoa', 'BS_SAN2', '0909005002', 'nga.san@benhvien.vn' UNION ALL
  SELECT 'bs_mat1', 'Trịnh Văn Khoa', 'Mắt', 'BS_MAT1', '0909006001', 'khoa.mat@benhvien.vn' UNION ALL
  SELECT 'bs_mat2', 'Lưu Thị Oanh', 'Mắt', 'BS_MAT2', '0909006002', 'oanh.mat@benhvien.vn' UNION ALL
  SELECT 'bs_tmh1', 'Lý Thanh Tùng', 'Tai mũi họng', 'BS_TMH1', '0909007001', 'tung.tmh@benhvien.vn' UNION ALL
  SELECT 'bs_tmh2', 'Huỳnh Văn Phong', 'Tai mũi họng', 'BS_TMH2', '0909007002', 'phong.tmh@benhvien.vn' UNION ALL
  SELECT 'bs_dalieu1', 'Bùi Thị Hương', 'Da liễu', 'BS_DALIEU1', '0909008001', 'huong.dalieu@benhvien.vn' UNION ALL
  SELECT 'bs_dalieu2', 'Cao Văn Sơn', 'Da liễu', 'BS_DALIEU2', '0909008002', 'son.dalieu@benhvien.vn' UNION ALL
  SELECT 'bs_thankinh1', 'Nguyễn Thị Lý', 'Thần kinh', 'BS_TK1', '0909009001', 'ly.thankinh@benhvien.vn' UNION ALL
  SELECT 'bs_thankinh2', 'Trần Quốc Huy', 'Thần kinh', 'BS_TK2', '0909009002', 'huy.thankinh@benhvien.vn'
) AS v
JOIN TaiKhoan tk ON tk.TenDangNhap = v.TenDangNhap
WHERE NOT EXISTS (
  SELECT 1 FROM BacSi bs WHERE bs.MaTaiKhoan = tk.MaTaiKhoan
)
AND NOT EXISTS (
  SELECT 1 FROM BacSi bs2 WHERE bs2.BacSiCode = v.BacSiCode
);

-- Kiểm tra nhanh
SELECT bs.ChuyenKhoa,
       COUNT(*) AS soBacSi,
       GROUP_CONCAT(tk.TenDangNhap ORDER BY tk.TenDangNhap SEPARATOR ', ') AS accounts
FROM BacSi bs
LEFT JOIN TaiKhoan tk ON bs.MaTaiKhoan = tk.MaTaiKhoan
GROUP BY bs.ChuyenKhoa
ORDER BY bs.ChuyenKhoa;
