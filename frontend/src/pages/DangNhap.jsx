import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function DangNhap() {
  const [form, setForm] = useState({ tenDangNhap: '', matKhau: '' });
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.MaChucVu;
      if (role === 1) navigate('/quan-ly');
      else if (role === 2) navigate('/bac-si');
      else if (role === 4) navigate('/benh-nhan');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/dangnhap', form);
      login(res.data.user, res.data.token);
      toast.success('Đăng nhập thành công!');
      const role = res.data.user.MaChucVu;
      if (role === 1) navigate('/quan-ly');
      else if (role === 2) navigate('/bac-si');
      else if (role === 4) navigate('/benh-nhan');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSignInAlt className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Đăng nhập</h2>
            <p className="text-gray-600 mt-2">Chào mừng bạn trở lại</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={form.tenDangNhap}
                onChange={e => setForm({...form, tenDangNhap: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                Mật khẩu
              </label>
              <input
                type="password"
                value={form.matKhau}
                onChange={e => setForm({...form, matKhau: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/dat-lai-mat-khau" className="text-sm text-red-600 hover:text-red-700 font-medium">
              Quên mật khẩu?
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="text-red-600 hover:text-red-700 font-semibold">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

