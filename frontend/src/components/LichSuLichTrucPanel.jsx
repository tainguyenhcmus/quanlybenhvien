import React, { useEffect, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import api from '../services/api';
import { formatDateTimeVN, formatDateVN } from '../utils/date';

const ACTION_LABEL = {
  TaoMoi: 'Tạo mới',
  DangKy: 'Đăng ký',
  CapNhat: 'Cập nhật',
  Duyet: 'Duyệt ca',
  TuChoi: 'Từ chối ca',
  Xoa: 'Xóa/Hủy',
  YeuCauNhuong: 'Yêu cầu nhượng',
  YeuCauHoanDoi: 'Yêu cầu hoán đổi',
  XacNhanHoanDoi: 'Xác nhận hoán đổi',
  TuChoiHoanDoi: 'Từ chối hoán đổi',
  HuyHoanDoi: 'Hủy yêu cầu',
  AdminTuChoiHoanDoi: 'Admin từ chối',
  DuyetNhuong: 'Duyệt nhượng',
  DuyetHoanDoi: 'Duyệt hoán đổi'
};

const ACTION_COLOR = {
  Duyet: 'bg-green-100 text-green-800',
  DuyetNhuong: 'bg-green-100 text-green-800',
  DuyetHoanDoi: 'bg-green-100 text-green-800',
  TaoMoi: 'bg-blue-100 text-blue-800',
  DangKy: 'bg-yellow-100 text-yellow-800',
  TuChoi: 'bg-red-100 text-red-800',
  TuChoiHoanDoi: 'bg-red-100 text-red-800',
  AdminTuChoiHoanDoi: 'bg-red-100 text-red-800',
  Xoa: 'bg-gray-100 text-gray-800',
  HuyHoanDoi: 'bg-gray-100 text-gray-800'
};

/**
 * @param {{ maLichTruc?: number, title?: string, compact?: boolean }} props
 */
export default function LichSuLichTrucPanel({ maLichTruc, title = 'Lịch sử thay đổi', compact = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const params = maLichTruc ? { maLichTruc } : {};
        const res = await api.get('/lichsu', { params });
        if (!cancelled) setItems(res.data || []);
      } catch (_) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [maLichTruc]);

  return (
    <div className={compact ? '' : 'bg-white rounded-xl shadow-lg border border-gray-100 p-6'}>
      <h3 className={`font-bold text-gray-800 mb-4 flex items-center gap-2 ${compact ? 'text-lg' : 'text-xl'}`}>
        <FaHistory className="text-indigo-500" />
        {title}
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500 text-center py-6">Đang tải...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">Chưa có lịch sử</p>
      ) : (
        <div className={`space-y-3 ${compact ? 'max-h-72' : 'max-h-96'} overflow-y-auto`}>
          {items.map((ls) => (
            <div key={ls.MaLichSu} className="relative pl-4 border-l-2 border-indigo-200 pb-1">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-400 border-2 border-white" />
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${ACTION_COLOR[ls.LoaiHanhDong] || 'bg-indigo-100 text-indigo-800'}`}>
                  {ACTION_LABEL[ls.LoaiHanhDong] || ls.LoaiHanhDong}
                </span>
                {ls.NgayTruc && (
                  <span className="text-[10px] text-gray-500">
                    Ca {formatDateVN(ls.NgayTruc)}{ls.CaTruc ? ` · ${ls.CaTruc}` : ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-800">{ls.MoTa}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {ls.NguoiThucHien || ls.TenDangNhap || 'Hệ thống'} · {formatDateTimeVN(ls.NgayTao)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
