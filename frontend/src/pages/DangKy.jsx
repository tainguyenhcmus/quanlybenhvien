import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserPlus } from 'react-icons/fa';

export default function DangKy() {
  const [form, setForm] = useState({
    tenDangNhap: '',
    matKhau: '',
    xacNhanMatKhau: '',
    hoTen: '',
    email: '',
    dienThoai: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.matKhau !== form.xacNhanMatKhau) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/dangky', {
        tenDangNhap: form.tenDangNhap,
        matKhau: form.matKhau,
        hoTen: form.hoTen,
        email: form.email,
        dienThoai: form.dienThoai,
        maChucVu: 4 // Bệnh nhân
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/dang-nhap');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserPlus className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Đăng ký</h2>
            <p className="text-gray-600 mt-2">Tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Tên đăng nhập *
              </label>
              <input
                type="text"
                value={form.tenDangNhap}
                onChange={e => setForm({...form, tenDangNhap: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ tên *
              </label>
              <input
                type="text"
                value={form.hoTen}
                onChange={e => setForm({...form, hoTen: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Điện thoại
              </label>
              <input
                type="tel"
                value={form.dienThoai}
                onChange={e => setForm({...form, dienThoai: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                Mật khẩu *
              </label>
              <input
                type="password"
                value={form.matKhau}
                onChange={e => setForm({...form, matKhau: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                value={form.xacNhanMatKhau}
                onChange={e => setForm({...form, xacNhanMatKhau: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <>
                  <FaUserPlus />
                  <span>Đăng ký</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="text-green-600 hover:text-green-700 font-semibold">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

