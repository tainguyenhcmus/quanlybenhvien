-- ===============================
-- HỆ THỐNG QUẢN LÝ BỆNH VIỆN - MySQL VERSION
-- ===============================

CREATE DATABASE IF NOT EXISTS QuanLyBenhVien CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyBenhVien;

-- ===============================
-- XÓA BẢNG CŨ (nếu tồn tại)
-- ===============================
DROP TABLE IF EXISTS HoaDon;
DROP TABLE IF EXISTS HoSoBenhAn;
DROP TABLE IF EXISTS ThongBao;
DROP TABLE IF EXISTS LichSuLichTruc;
DROP TABLE IF EXISTS YeuCauHoanDoiCa;
DROP TABLE IF EXISTS LichTruc;
DROP TABLE IF EXISTS LichKham;
DROP TABLE IF EXISTS PhongKham;
DROP TABLE IF EXISTS BacSi;
DROP TABLE IF EXISTS BenhNhan;
DROP TABLE IF EXISTS TaiKhoan;
DROP TABLE IF EXISTS ChucVu;

-- ===============================
-- BẢNG: CHỨC VỤ
-- ===============================
CREATE TABLE ChucVu (
    MaChucVu INT AUTO_INCREMENT PRIMARY KEY,
    TenChucVu VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO ChucVu (TenChucVu)
VALUES 
('Quản lý'),
('Bác sĩ'),
('Nhân viên'),
('Bệnh nhân');

-- ===============================
-- BẢNG: TÀI KHOẢN
-- ===============================
CREATE TABLE TaiKhoan (
    MaTaiKhoan INT AUTO_INCREMENT PRIMARY KEY,
    TenDangNhap VARCHAR(100) UNIQUE NOT NULL,
    MatKhauHash VARCHAR(256) NOT NULL,
    MaChucVu INT NOT NULL,
    HoTen VARCHAR(200),
    Email VARCHAR(200),
    DienThoai VARCHAR(50),
    DiaChi VARCHAR(300),
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaChucVu) REFERENCES ChucVu(MaChucVu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: BỆNH NHÂN
-- ===============================
CREATE TABLE BenhNhan (
    MaBenhNhan INT AUTO_INCREMENT PRIMARY KEY,
    MaTaiKhoan INT,
    MaTheBV VARCHAR(50),
    HoTen VARCHAR(200),
    NgaySinh DATE,
    GioiTinh VARCHAR(20),
    DiaChi VARCHAR(300),
    SDT VARCHAR(50),
    NgayDangKy DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: BÁC SĨ
-- ===============================
CREATE TABLE BacSi (
    MaBacSi INT AUTO_INCREMENT PRIMARY KEY,
    MaTaiKhoan INT,
    HoTen VARCHAR(200) NOT NULL,
    ChuyenKhoa VARCHAR(150),
    BacSiCode VARCHAR(50) UNIQUE,
    SDT VARCHAR(50),
    Email VARCHAR(200),
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: PHÒNG KHÁM
-- ===============================
CREATE TABLE PhongKham (
    MaPhong INT AUTO_INCREMENT PRIMARY KEY,
    TenPhong VARCHAR(200) NOT NULL,
    MoTa VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: LỊCH KHÁM
-- ===============================
CREATE TABLE LichKham (
    MaLich INT AUTO_INCREMENT PRIMARY KEY,
    MaBenhNhan INT,
    MaBacSi INT,
    MaPhong INT,
    NgayKham DATETIME NOT NULL,
    TrangThai VARCHAR(50) DEFAULT 'Đã đặt',
    GhiChu VARCHAR(1000),
    FOREIGN KEY (MaBenhNhan) REFERENCES BenhNhan(MaBenhNhan),
    FOREIGN KEY (MaBacSi) REFERENCES BacSi(MaBacSi),
    FOREIGN KEY (MaPhong) REFERENCES PhongKham(MaPhong)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: LỊCH TRỰC BÁC SĨ
-- ===============================
CREATE TABLE LichTruc (
    MaLichTruc INT AUTO_INCREMENT PRIMARY KEY,
    MaBacSi INT NOT NULL,
    MaPhong INT,
    NgayTruc DATE NOT NULL,
    CaTruc VARCHAR(50) NOT NULL,
    TrangThai VARCHAR(50) DEFAULT 'Chờ duyệt',
    GhiChu VARCHAR(500),
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaBacSi) REFERENCES BacSi(MaBacSi),
    FOREIGN KEY (MaPhong) REFERENCES PhongKham(MaPhong),
    UNIQUE KEY uq_bacsi_ngay_ca (MaBacSi, NgayTruc, CaTruc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: YÊU CẦU HOÁN ĐỔI / NHƯỢNG CA
-- ===============================
CREATE TABLE YeuCauHoanDoiCa (
    MaYeuCau INT AUTO_INCREMENT PRIMARY KEY,
    LoaiYeuCau VARCHAR(20) NOT NULL,
    MaLichTrucGui INT NOT NULL,
    MaLichTrucNhan INT,
    MaBacSiGui INT NOT NULL,
    MaBacSiNhan INT NOT NULL,
    TrangThai VARCHAR(50) DEFAULT 'Chờ xác nhận',
    GhiChu VARCHAR(500),
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaLichTrucGui) REFERENCES LichTruc(MaLichTruc),
    FOREIGN KEY (MaLichTrucNhan) REFERENCES LichTruc(MaLichTruc),
    FOREIGN KEY (MaBacSiGui) REFERENCES BacSi(MaBacSi),
    FOREIGN KEY (MaBacSiNhan) REFERENCES BacSi(MaBacSi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: THÔNG BÁO
-- ===============================
CREATE TABLE ThongBao (
    MaThongBao INT AUTO_INCREMENT PRIMARY KEY,
    MaTaiKhoan INT NOT NULL,
    TieuDe VARCHAR(200) NOT NULL,
    NoiDung VARCHAR(1000),
    Loai VARCHAR(50) DEFAULT 'HeThong',
    MaLienKet INT,
    DaDoc TINYINT(1) DEFAULT 0,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE,
    INDEX idx_thongbao_user (MaTaiKhoan, DaDoc, NgayTao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: LỊCH SỬ LỊCH TRỰC
-- ===============================
CREATE TABLE LichSuLichTruc (
    MaLichSu INT AUTO_INCREMENT PRIMARY KEY,
    MaLichTruc INT,
    LoaiHanhDong VARCHAR(50) NOT NULL,
    MoTa VARCHAR(1000) NOT NULL,
    MaTaiKhoan INT,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE SET NULL,
    INDEX idx_lichsu_lichtruc (MaLichTruc, NgayTao),
    INDEX idx_lichsu_ngay (NgayTao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: HỒ SƠ BỆNH ÁN
-- ===============================
CREATE TABLE HoSoBenhAn (
    MaHoSo INT AUTO_INCREMENT PRIMARY KEY,
    MaLich INT NOT NULL,
    ChanDoan VARCHAR(1000),
    Thuoc VARCHAR(1000),
    KetQuaXN VARCHAR(2000),
    GhiChu VARCHAR(2000),
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MaLich) REFERENCES LichKham(MaLich) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BẢNG: HÓA ĐƠN
-- ===============================
CREATE TABLE HoaDon (
    MaHoaDon INT AUTO_INCREMENT PRIMARY KEY,
    MaLich INT,
    SoTien DECIMAL(18,2) DEFAULT 0,
    DaThanhToan BOOLEAN DEFAULT 0,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaLich) REFERENCES LichKham(MaLich)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- DỮ LIỆU MẪU BAN ĐẦU
-- ===============================

-- Admin (Quản lý)
INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
VALUES ('admin', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 1, 'Quản trị hệ thống', 'admin@benhvien.vn', '0909000111');

-- Tài khoản bác sĩ mẫu (mật khẩu: 123456)
INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai) VALUES
('bacsi1', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Nguyễn Văn A', 'bs1@benhvien.vn', '0909123456'),
('bacsi_tim2', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Phạm Minh Đức', 'duc.tim@benhvien.vn', '0909111010'),
('bacsi_noi2', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Hoàng Thị Lan', 'lan.noi@benhvien.vn', '0909111011'),
('bacsi_ngoai2', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Vũ Quốc Bảo', 'bao.ngoai@benhvien.vn', '0909111012'),
('bacsi_nhi', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Đặng Thu Hà', 'ha.nhi@benhvien.vn', '0909111013'),
('bacsi_san', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Ngô Thị Mai', 'mai.san@benhvien.vn', '0909111014'),
('bacsi_mat', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Trịnh Văn Khoa', 'khoa.mat@benhvien.vn', '0909111015'),
('bacsi_tmh', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Lý Thanh Tùng', 'tung.tmh@benhvien.vn', '0909111016'),
('bacsi_dalieu', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Bùi Thị Hương', 'huong.dalieu@benhvien.vn', '0909111017');

-- Bác sĩ mẫu (liên kết với tài khoản — MaTaiKhoan 2..10)
INSERT INTO BacSi (MaTaiKhoan, HoTen, ChuyenKhoa, BacSiCode, SDT, Email) VALUES
(2, 'Nguyễn Văn A', 'Tim mạch', 'BS001', '0909123456', 'bs1@benhvien.vn'),
(3, 'Phạm Minh Đức', 'Tim mạch', 'BS010', '0909111010', 'duc.tim@benhvien.vn'),
(4, 'Hoàng Thị Lan', 'Nội khoa', 'BS011', '0909111011', 'lan.noi@benhvien.vn'),
(5, 'Vũ Quốc Bảo', 'Ngoại khoa', 'BS012', '0909111012', 'bao.ngoai@benhvien.vn'),
(6, 'Đặng Thu Hà', 'Nhi khoa', 'BS013', '0909111013', 'ha.nhi@benhvien.vn'),
(7, 'Ngô Thị Mai', 'Sản phụ khoa', 'BS014', '0909111014', 'mai.san@benhvien.vn'),
(8, 'Trịnh Văn Khoa', 'Mắt', 'BS015', '0909111015', 'khoa.mat@benhvien.vn'),
(9, 'Lý Thanh Tùng', 'Tai mũi họng', 'BS016', '0909111016', 'tung.tmh@benhvien.vn'),
(10, 'Bùi Thị Hương', 'Da liễu', 'BS017', '0909111017', 'huong.dalieu@benhvien.vn');

-- Phòng khám mẫu
INSERT INTO PhongKham (TenPhong, MoTa) VALUES
('Khoa Tim mạch', 'Khám và điều trị bệnh lý tim mạch'),
('Khoa Nội', 'Nội khoa tổng quát'),
('Khoa Ngoại', 'Ngoại khoa tổng quát'),
('Khoa Nhi', 'Khám và điều trị nhi khoa'),
('Khoa Sản', 'Sản phụ khoa'),
('Khoa Mắt', 'Khám mắt'),
('Khoa Tai mũi họng', 'TMH'),
('Khoa Da liễu', 'Da liễu'),
('Khoa Thần kinh', 'Thần kinh');

-- Một tài khoản bệnh nhân demo
INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
VALUES ('benhnhan1', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 4, 'Lê Thị B', 'lethib@benhvien.vn', '0909555666');

-- Thêm thông tin bệnh nhân tương ứng (MaTaiKhoan = 11 sau các bác sĩ trên)
INSERT INTO BenhNhan (MaTaiKhoan, MaTheBV, HoTen, NgaySinh, GioiTinh, DiaChi, SDT)
VALUES (11, 'BV001', 'Lê Thị B', '1990-05-12', 'Nữ', '12 Nguyễn Trãi, TP.HCM', '0909555666');

-- Một lịch khám mẫu
INSERT INTO LichKham (MaBenhNhan, MaBacSi, MaPhong, NgayKham, TrangThai, GhiChu)
VALUES (1, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Đã đặt', 'Khám kiểm tra sức khỏe tổng quát');

-- Hóa đơn mẫu
INSERT INTO HoaDon (MaLich, SoTien, DaThanhToan)
VALUES (1, 300000.00, 0);

-- Lịch trực mẫu
INSERT INTO LichTruc (MaBacSi, MaPhong, NgayTruc, CaTruc, TrangThai, GhiChu)
VALUES (1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Sáng', 'Đã duyệt', 'Trực khoa Tim mạch');