import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaFileMedical, FaStethoscope, FaPills, FaFlask, FaNotesMedical, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

export default function MedicalRecord({ maLich, maBenhNhan, canEdit = false, onUpdate }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ChanDoan: '', Thuoc: '', KetQuaXN: '', GhiChu: '' });

  useEffect(() => {
    if (maLich) {
      loadRecord();
    }
  }, [maLich]);

  useEffect(() => {
    if (!loading && !record && canEdit && !editing) {
      setEditing(true);
    }
  }, [loading, record, canEdit, editing]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hosobenhan/lich/${maLich}`);
      setRecord(res.data);
      setForm({
        ChanDoan: res.data.ChanDoan || '',
        Thuoc: res.data.Thuoc || '',
        KetQuaXN: res.data.KetQuaXN || '',
        GhiChu: res.data.GhiChu || ''
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setRecord(null);
        setForm({ ChanDoan: '', Thuoc: '', KetQuaXN: '', GhiChu: '' });
      } else {
        console.error('Error loading medical record:', err);
        setRecord(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.ChanDoan || form.ChanDoan.trim() === '') {
      toast.warning('Vui lòng nhập chẩn đoán');
      return;
    }

    try {
      if (record) {
        await api.put(`/hosobenhan/${record.MaHoSo}`, form);
        toast.success('Cập nhật hồ sơ bệnh án thành công');
      } else {
        if (!maLich) {
          toast.error('Thiếu thông tin lịch khám');
          return;
        }
        await api.post('/hosobenhan', { MaLich: maLich, ...form });
        toast.success('Tạo hồ sơ bệnh án thành công');
      }
      setEditing(false);
      await loadRecord();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <svg className="animate-spin h-6 w-6 text-red-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!record && !canEdit) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        <FaFileMedical className="text-4xl mx-auto mb-2 opacity-50" />
        <p>Chưa có hồ sơ bệnh án cho lịch khám này</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <FaFileMedical className="text-white text-xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Hồ sơ bệnh án</h3>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {editing ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FaSave />
                <span>{record ? 'Cập nhật' : 'Tạo hồ sơ'}</span>
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FaEdit />
                <span>{record ? 'Sửa' : 'Tạo hồ sơ'}</span>
              </button>
            )}
            {editing && (
              <button
                onClick={() => {
                  setEditing(false);
                  if (record) {
                    setForm({
                      ChanDoan: record.ChanDoan || '',
                      Thuoc: record.Thuoc || '',
                      KetQuaXN: record.KetQuaXN || '',
                      GhiChu: record.GhiChu || ''
                    });
                  }
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FaTimes />
                <span>Hủy</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {editing && !record && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 font-medium">
              📝 Bạn đang tạo hồ sơ bệnh án mới. Vui lòng điền đầy đủ thông tin.
            </p>
          </div>
        )}
        
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FaStethoscope className="text-red-600" />
            Chẩn đoán {editing && <span className="text-red-500">*</span>}
          </label>
          {editing ? (
            <textarea
              value={form.ChanDoan}
              onChange={e => setForm({...form, ChanDoan: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows="3"
              placeholder="Nhập chẩn đoán..."
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
              {record?.ChanDoan || <span className="text-gray-400">Chưa có thông tin</span>}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FaPills className="text-green-500" />
            Thuốc kê đơn
          </label>
          {editing ? (
            <textarea
              value={form.Thuoc}
              onChange={e => setForm({...form, Thuoc: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows="3"
              placeholder="Nhập thuốc kê đơn..."
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
              {record?.Thuoc || <span className="text-gray-400">Chưa có thông tin</span>}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FaFlask className="text-purple-500" />
            Kết quả xét nghiệm
          </label>
          {editing ? (
            <textarea
              value={form.KetQuaXN}
              onChange={e => setForm({...form, KetQuaXN: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows="4"
              placeholder="Nhập kết quả xét nghiệm..."
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
              {record?.KetQuaXN || <span className="text-gray-400">Chưa có thông tin</span>}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FaNotesMedical className="text-orange-500" />
            Ghi chú
          </label>
          {editing ? (
            <textarea
              value={form.GhiChu}
              onChange={e => setForm({...form, GhiChu: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              rows="3"
              placeholder="Nhập ghi chú..."
            />
          ) : (
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
              {record?.GhiChu || <span className="text-gray-400">Chưa có thông tin</span>}
            </div>
          )}
        </div>

        {record && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Cập nhật lần cuối: {new Date(record.NgayCapNhat).toLocaleString('vi-VN')}
          </div>
        )}
      </div>
    </div>
  );
}

