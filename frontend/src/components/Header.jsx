import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHospital, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <FaHospital className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Bệnh Viện</h1>
              <p className="text-xs text-gray-500">Hệ thống quản lý</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {user.MaChucVu === 1 && (
                  <Link
                    to="/quan-ly"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/quan-ly')
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                    }`}
                  >
                    Quản lý
                  </Link>
                )}
                {(user.MaChucVu === 1 || user.MaChucVu === 2) && (
                  <Link
                    to="/bac-si"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/bac-si')
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                    }`}
                  >
                    Bác sĩ
                  </Link>
                )}
                {user.MaChucVu === 4 && (
                  <Link
                    to="/benh-nhan"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/benh-nhan')
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                    }`}
                  >
                    Bệnh nhân
                  </Link>
                )}
                <div className="ml-2 pl-2 border-l border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">{user.HoTen || user.TenDangNhap}</div>
                      <div className="text-xs text-gray-500">
                        {user.MaChucVu === 1 ? 'Quản lý' : user.MaChucVu === 2 ? 'Bác sĩ' : 'Bệnh nhân'}
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all flex items-center gap-2 font-medium text-sm border border-red-200"
                    >
                      <FaSignOutAlt />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/dang-nhap"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/dang-ky"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

