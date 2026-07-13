-- Migration: thêm bảng LichTruc cho DB đã tồn tại
USE QuanLyBenhVien;

CREATE TABLE IF NOT EXISTS LichTruc (
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
