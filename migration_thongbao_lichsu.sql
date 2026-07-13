-- Migration: Thông báo + Lịch sử lịch trực
USE QuanLyBenhVien;

CREATE TABLE IF NOT EXISTS ThongBao (
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

CREATE TABLE IF NOT EXISTS LichSuLichTruc (
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
