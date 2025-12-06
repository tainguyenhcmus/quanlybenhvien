-- ===============================
-- HỆ THỐNG QUẢN LÝ BỆNH VIỆN
-- ===============================

-- Nếu chưa có DB thì tạo mới
IF DB_ID(N'QuanLyBenhVien') IS NULL
BEGIN
    CREATE DATABASE QuanLyBenhVien;
    PRINT '✅ Đã tạo database QuanLyBenhVien';
END
GO

USE QuanLyBenhVien;
GO

-- ===============================
-- XÓA BẢNG CŨ (nếu tồn tại)
-- ===============================
IF OBJECT_ID('HoaDon') IS NOT NULL DROP TABLE HoaDon;
IF OBJECT_ID('HoSoBenhAn') IS NOT NULL DROP TABLE HoSoBenhAn;
IF OBJECT_ID('LichKham') IS NOT NULL DROP TABLE LichKham;
IF OBJECT_ID('PhongKham') IS NOT NULL DROP TABLE PhongKham;
IF OBJECT_ID('BacSi') IS NOT NULL DROP TABLE BacSi;
IF OBJECT_ID('BenhNhan') IS NOT NULL DROP TABLE BenhNhan;
IF OBJECT_ID('TaiKhoan') IS NOT NULL DROP TABLE TaiKhoan;
IF OBJECT_ID('ChucVu') IS NOT NULL DROP TABLE ChucVu;
GO

-- ===============================
-- BẢNG: CHỨC VỤ
-- ===============================
CREATE TABLE ChucVu (
    MaChucVu INT IDENTITY(1,1) PRIMARY KEY,
    TenChucVu NVARCHAR(100) NOT NULL
);
GO

INSERT INTO ChucVu (TenChucVu)
VALUES 
(N'Quản lý'),
(N'Bác sĩ'),
(N'Nhân viên'),
(N'Bệnh nhân');
GO

-- ===============================
-- BẢNG: TÀI KHOẢN
-- ===============================
CREATE TABLE TaiKhoan (
    MaTaiKhoan INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap NVARCHAR(100) UNIQUE NOT NULL,
    MatKhauHash NVARCHAR(256) NOT NULL,
    MaChucVu INT NOT NULL FOREIGN KEY REFERENCES ChucVu(MaChucVu),
    HoTen NVARCHAR(200),
    Email NVARCHAR(200),
    DienThoai NVARCHAR(50),
    DiaChi NVARCHAR(300),
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- ===============================
-- BẢNG: BỆNH NHÂN
-- ===============================
CREATE TABLE BenhNhan (
    MaBenhNhan INT IDENTITY(1,1) PRIMARY KEY,
    MaTaiKhoan INT FOREIGN KEY REFERENCES TaiKhoan(MaTaiKhoan),
    MaTheBV NVARCHAR(50),
    HoTen NVARCHAR(200),
    NgaySinh DATE,
    GioiTinh NVARCHAR(20),
    DiaChi NVARCHAR(300),
    SDT NVARCHAR(50),
    NgayDangKy DATETIME DEFAULT GETDATE()
);
GO

-- ===============================
-- BẢNG: BÁC SĨ
-- ===============================
CREATE TABLE BacSi (
    MaBacSi INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(200) NOT NULL,
    ChuyenKhoa NVARCHAR(150),
    BacSiCode NVARCHAR(50) UNIQUE,
    SDT NVARCHAR(50),
    Email NVARCHAR(200)
);
GO

-- ===============================
-- BẢNG: PHÒNG KHÁM
-- ===============================
CREATE TABLE PhongKham (
    MaPhong INT IDENTITY(1,1) PRIMARY KEY,
    TenPhong NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(500)
);
GO

-- ===============================
-- BẢNG: LỊCH KHÁM
-- ===============================
CREATE TABLE LichKham (
    MaLich INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT FOREIGN KEY REFERENCES BenhNhan(MaBenhNhan),
    MaBacSi INT FOREIGN KEY REFERENCES BacSi(MaBacSi),
    MaPhong INT FOREIGN KEY REFERENCES PhongKham(MaPhong),
    NgayKham DATETIME NOT NULL,
    TrangThai NVARCHAR(50) DEFAULT N'Đã đặt', -- Đã đặt, Hoàn thành, Hủy
    GhiChu NVARCHAR(1000)
);
GO

-- ===============================
-- BẢNG: HỒ SƠ BỆNH ÁN
-- ===============================
CREATE TABLE HoSoBenhAn (
    MaHoSo INT IDENTITY(1,1) PRIMARY KEY,
    MaLich INT FOREIGN KEY REFERENCES LichKham(MaLich),
    ChanDoan NVARCHAR(1000),
    Thuoc NVARCHAR(1000),
    KetQuaXN NVARCHAR(2000),
    GhiChu NVARCHAR(2000),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- ===============================
-- BẢNG: HÓA ĐƠN
-- ===============================
CREATE TABLE HoaDon (
    MaHoaDon INT IDENTITY(1,1) PRIMARY KEY,
    MaLich INT FOREIGN KEY REFERENCES LichKham(MaLich),
    SoTien DECIMAL(18,2) DEFAULT 0,
    DaThanhToan BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- ===============================
-- DỮ LIỆU MẪU BAN ĐẦU
-- ===============================

-- Admin (Quản lý)
INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
VALUES (N'admin', N'$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 1, N'Quản trị hệ thống', 'admin@benhvien.vn', '0909000111');
-- MatKhauHash ở trên là bcrypt hash của: Admin@123

-- Một bác sĩ mẫu
INSERT INTO BacSi (HoTen, ChuyenKhoa, BacSiCode, SDT, Email)
VALUES (N'Nguyễn Văn A', N'Tim mạch', N'BS001', N'0909123456', N'bs1@benhvien.vn');

-- Một phòng khám mẫu
INSERT INTO PhongKham (TenPhong, MoTa)
VALUES (N'Khoa Tim mạch', N'Khám và điều trị bệnh lý tim mạch');

-- Một tài khoản bệnh nhân demo
INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, MaChucVu, HoTen, Email, DienThoai)
VALUES (N'benhnhan1', N'$2b$10$kBz6Kf0yVRXuv7ZmxR3NYu.mrkSguv0bZZ1p6bQ8CsfBD1jtuD0cu', 4, N'Lê Thị B', 'lethib@benhvien.vn', '0909555666');

-- Thêm thông tin bệnh nhân tương ứng
INSERT INTO BenhNhan (MaTaiKhoan, MaTheBV, HoTen, NgaySinh, GioiTinh, DiaChi, SDT)
VALUES (2, N'BV001', N'Lê Thị B', '1990-05-12', N'Nữ', N'12 Nguyễn Trãi, TP.HCM', N'0909555666');

-- Một lịch khám mẫu
INSERT INTO LichKham (MaBenhNhan, MaBacSi, MaPhong, NgayKham, TrangThai, GhiChu)
VALUES (1, 1, 1, DATEADD(DAY, 1, GETDATE()), N'Đã đặt', N'Khám kiểm tra sức khỏe tổng quát');

-- Hóa đơn mẫu
INSERT INTO HoaDon (MaLich, SoTien, DaThanhToan)
VALUES (1, 300000.00, 0);
GO

PRINT '🎉 Database QuanLyBenhVien đã được tạo và khởi tạo dữ liệu mẫu thành công!';
