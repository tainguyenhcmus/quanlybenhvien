-- Migration: thêm bảng YeuCauHoanDoiCa
USE QuanLyBenhVien;

CREATE TABLE IF NOT EXISTS YeuCauHoanDoiCa (
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
