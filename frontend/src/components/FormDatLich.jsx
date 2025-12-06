import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaUserMd, FaHospital, FaClock } from 'react-icons/fa';

export default function FormDatLich({ onSuccess }) {
  const [form, setForm] = useState({ maBacSi: '', maPhong: '', ngayKham: '', ghiChu: '' });
  const [bacSi, setBacSi] = useState([]);
  const [phongKham, setPhongKham] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const bsRes = await api.get('/bacsi');
      setBacSi(bsRes.data);
      // Phòng khám - using hardcoded for now, or create API endpoint
      setPhongKham([
        { MaPhong: 1, TenPhong: 'Khoa Tim mạch' },
        { MaPhong: 2, TenPhong: 'Khoa Nội khoa' },
        { MaPhong: 3, TenPhong: 'Khoa Ngoại khoa' }
      ]);
    } catch (err) {
      console.error('Error loading options:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert frontend form fields to backend expected format (PascalCase)
      const payload = {
        MaBacSi: parseInt(form.maBacSi),
        MaPhong: parseInt(form.maPhong),
        NgayKham: form.ngayKham,
        GhiChu: form.ghiChu || null
      };
      await api.post('/lichkham', payload);
      toast.success('Đặt lịch khám thành công!');
      setForm({ maBacSi: '', maPhong: '', ngayKham: '', ghiChu: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đặt lịch thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Đặt lịch khám</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaUserMd className="inline mr-2" />
            Bác sĩ *
          </label>
          <select
            value={form.maBacSi}
            onChange={e => setForm({...form, maBacSi: e.target.value})}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
            required
          >
            <option value="">-- Chọn bác sĩ --</option>
            {bacSi.map(bs => (
              <option key={bs.MaBacSi} value={bs.MaBacSi}>
                {bs.HoTen} - {bs.ChuyenKhoa}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaHospital className="inline mr-2" />
            Phòng khám *
          </label>
          <select
            value={form.maPhong}
            onChange={e => setForm({...form, maPhong: e.target.value})}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
            required
          >
            <option value="">-- Chọn phòng --</option>
            {phongKham.map(pk => (
              <option key={pk.MaPhong} value={pk.MaPhong}>
                {pk.TenPhong}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaClock className="inline mr-2" />
            Ngày giờ khám *
          </label>
          <input
            type="datetime-local"
            value={form.ngayKham}
            onChange={e => setForm({...form, ngayKham: e.target.value})}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
          <textarea
            value={form.ghiChu}
            onChange={e => setForm({...form, ghiChu: e.target.value})}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đặt lịch'}
        </button>
      </form>
    </div>
  );
}

