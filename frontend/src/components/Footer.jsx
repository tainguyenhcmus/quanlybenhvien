import React from 'react';
import { FaHospital, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <FaHospital className="text-3xl text-red-500" />
              <h3 className="text-xl font-bold">Bệnh Viện</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Hệ thống quản lý bệnh viện hiện đại, chuyên nghiệp và đáng tin cậy.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Trang chủ</a></li>
              <li><a href="/dang-ky" className="hover:text-white transition-colors">Đăng ký</a></li>
              <li><a href="/dang-nhap" className="hover:text-white transition-colors">Đăng nhập</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Thông tin liên hệ</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <FaPhone className="text-red-500" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-red-500" />
                <span>info@benhvien.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" />
                <span>123 Đường ABC, TP.HCM</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Hệ Thống Quản Lý Bệnh Viện. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

