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

-- Một tài khoản bác sĩ mẫu
INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
VALUES ('bacsi1', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 2, 'Nguyễn Văn A', 'bs1@benhvien.vn', '0909123456');

-- Một bác sĩ mẫu (liên kết với tài khoản)
INSERT INTO BacSi (MaTaiKhoan, HoTen, ChuyenKhoa, BacSiCode, SDT, Email)
VALUES (2, 'Nguyễn Văn A', 'Tim mạch', 'BS001', '0909123456', 'bs1@benhvien.vn');

-- Một phòng khám mẫu
INSERT INTO PhongKham (TenPhong, MoTa)
VALUES ('Khoa Tim mạch', 'Khám và điều trị bệnh lý tim mạch');

-- Một tài khoản bệnh nhân demo
INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
VALUES ('benhnhan1', '$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 4, 'Lê Thị B', 'lethib@benhvien.vn', '0909555666');

-- Thêm thông tin bệnh nhân tương ứng
INSERT INTO BenhNhan (MaTaiKhoan, MaTheBV, HoTen, NgaySinh, GioiTinh, DiaChi, SDT)
VALUES (3, 'BV001', 'Lê Thị B', '1990-05-12', 'Nữ', '12 Nguyễn Trãi, TP.HCM', '0909555666');

-- Một lịch khám mẫu
INSERT INTO LichKham (MaBenhNhan, MaBacSi, MaPhong, NgayKham, TrangThai, GhiChu)
VALUES (1, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Đã đặt', 'Khám kiểm tra sức khỏe tổng quát');

-- Hóa đơn mẫu
INSERT INTO HoaDon (MaLich, SoTien, DaThanhToan)
VALUES (1, 300000.00, 0);