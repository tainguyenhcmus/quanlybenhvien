import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { formatDateTimeVN } from '../utils/date';

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/thongbao'),
        api.get('/thongbao/chua-doc')
      ]);
      setItems(listRes.data || []);
      setUnread(countRes.data?.SoLuong || 0);
    } catch (e) {
      // bảng chưa migrate hoặc chưa đăng nhập
    }
  }, [user]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;

  const markOne = async (id) => {
    try {
      await api.put(`/thongbao/${id}/doc`);
      await load();
    } catch (_) {}
  };

  const markAll = async () => {
    try {
      await api.put('/thongbao/doc-tat-ca');
      await load();
    } catch (_) {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) load(); }}
        className="relative p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-all"
        aria-label="Thông báo"
      >
        <FaBell className="text-lg" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Thông báo</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <FaCheckDouble /> Đọc tất cả
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-10">Chưa có thông báo</p>
            ) : (
              items.map((tb) => (
                <button
                  type="button"
                  key={tb.MaThongBao}
                  onClick={() => !tb.DaDoc && markOne(tb.MaThongBao)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-all ${
                    !tb.DaDoc ? 'bg-red-50/60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!tb.DaDoc ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {tb.TieuDe}
                    </p>
                    {!tb.DaDoc && <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />}
                  </div>
                  {tb.NoiDung && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tb.NoiDung}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTimeVN(tb.NgayTao)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
