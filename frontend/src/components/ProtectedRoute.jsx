import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaShieldAlt, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/dang-nhap" replace />;
  if (roles.length > 0 && !roles.includes(user.MaChucVu)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaLock className="text-red-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Không có quyền truy cập</h2>
            <p className="text-gray-600 mb-6">
              Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Về trang chủ
              </Link>
              <Link
                to="/dang-nhap"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
              >
                Đăng nhập lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return children;
}

