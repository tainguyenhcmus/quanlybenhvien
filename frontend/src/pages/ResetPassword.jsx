import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaLock, FaKey } from 'react-icons/fa';

export default function ResetPassword() {
  const [form, setForm] = useState({ tenDangNhap: '', matKhauMoi: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        tenDangNhap: form.tenDangNhap,
        matKhauMoi: form.matKhauMoi
      });
      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/dang-nhap');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaKey className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
            <p className="text-gray-600 mt-2">Nhập tên đăng nhập và mật khẩu mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập *
              </label>
              <input
                type="text"
                value={form.tenDangNhap}
                onChange={e => setForm({...form, tenDangNhap: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                Mật khẩu mới *
              </label>
              <input
                type="password"
                value={form.matKhauMoi}
                onChange={e => setForm({...form, matKhauMoi: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <FaKey />
                  <span>Đặt lại mật khẩu</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

