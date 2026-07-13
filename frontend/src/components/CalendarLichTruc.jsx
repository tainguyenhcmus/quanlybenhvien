import React, { useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import { toDateKey, todayKey } from '../utils/date';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const CA_COLORS = {
  'Sáng': 'bg-amber-100 text-amber-800 border-amber-200',
  'Chiều': 'bg-orange-100 text-orange-800 border-orange-200',
  'Đêm': 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

const STATUS_DOT = {
  'Đã duyệt': 'bg-green-500',
  'Chờ duyệt': 'bg-yellow-500',
  'Từ chối': 'bg-red-500'
};

function buildMonthCells(year, month) {
  const first = new Date(year, month, 1);
  // Monday-based: Sun=0 -> 6, Mon=1 -> 0, ...
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startPad; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

/**
 * @param {object} props
 * @param {Array} props.data - danh sách lịch trực
 * @param {boolean} [props.showDoctor] - hiện tên bác sĩ (admin)
 * @param {function} [props.renderDayActions] - (items, dateKey) => ReactNode
 * @param {function} [props.onSelectItem] - click vào 1 ca
 */
export default function CalendarLichTruc({
  data = [],
  showDoctor = false,
  renderDayActions,
  onSelectItem
}) {
  const today = new Date();
  const todayStr = todayKey();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(todayStr);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const byDate = useMemo(() => {
    const map = {};
    data.forEach((item) => {
      const key = toDateKey(item.NgayTruc);
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    Object.values(map).forEach((list) => {
      list.sort((a, b) => {
        const order = { 'Sáng': 0, 'Chiều': 1, 'Đêm': 2 };
        return (order[a.CaTruc] ?? 9) - (order[b.CaTruc] ?? 9);
      });
    });
    return map;
  }, [data]);

  const selectedItems = byDate[selectedKey] || [];
  const monthLabel = cursor.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(todayKey());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 flex items-center justify-center text-gray-600 transition-all"
            aria-label="Tháng trước"
          >
            <FaChevronLeft />
          </button>
          <h3 className="text-lg font-bold text-gray-800 capitalize min-w-[160px] text-center">
            {monthLabel}
          </h3>
          <button
            type="button"
            onClick={goNext}
            className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 flex items-center justify-center text-gray-600 transition-all"
            aria-label="Tháng sau"
          >
            <FaChevronRight />
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg flex items-center gap-2 transition-all"
        >
          <FaCalendarAlt />
          Hôm nay
        </button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-200 border border-amber-300" /> Sáng</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-200 border border-orange-300" /> Chiều</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-200 border border-indigo-300" /> Đêm</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Đã duyệt</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Chờ duyệt</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Từ chối</span>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2 uppercase tracking-wide">
            {d}
          </div>
        ))}

        {cells.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="min-h-[88px] sm:min-h-[110px] rounded-xl bg-gray-50/50" />;
          }

          const key = toDateKey(date);
          const items = byDate[key] || [];
          const isToday = key === todayStr;
          const isSelected = key === selectedKey;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <button
              type="button"
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`min-h-[88px] sm:min-h-[110px] rounded-xl border p-1.5 sm:p-2 text-left transition-all overflow-hidden
                ${isSelected ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-50/60' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'}
                ${isToday && !isSelected ? 'bg-blue-50/50 border-blue-200' : 'bg-white'}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-orange-500 text-white' : isWeekend ? 'text-red-500' : 'text-gray-700'}
                `}>
                  {date.getDate()}
                </span>
                {items.length > 0 && (
                  <span className="text-[10px] font-medium text-gray-400">{items.length}</span>
                )}
              </div>
              <div className="space-y-0.5">
                {items.slice(0, 3).map((item) => (
                  <div
                    key={item.MaLichTruc}
                    className={`text-[10px] sm:text-xs px-1 py-0.5 rounded border truncate flex items-center gap-1 ${CA_COLORS[item.CaTruc] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                    title={`${item.CaTruc}${showDoctor && item.TenBacSi ? ` · ${item.TenBacSi}` : ''}${item.TenPhong ? ` · ${item.TenPhong}` : ''} · ${item.TrangThai}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[item.TrangThai] || 'bg-gray-400'}`} />
                    <span className="truncate">
                      {item.CaTruc}
                      {showDoctor && item.TenBacSi ? ` · ${item.TenBacSi.split(' ').slice(-1)[0]}` : ''}
                    </span>
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="text-[10px] text-gray-500 pl-1">+{items.length - 3} ca</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 className="font-bold text-gray-800">
            Chi tiết ngày {selectedKey ? new Date(selectedKey + 'T00:00:00').toLocaleDateString('vi-VN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            }) : ''}
          </h4>
          {renderDayActions && selectedItems.length > 0 && (
            <div>{renderDayActions(selectedItems, selectedKey)}</div>
          )}
        </div>

        {selectedItems.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Không có ca trực trong ngày này</p>
        ) : (
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <div
                key={item.MaLichTruc}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${CA_COLORS[item.CaTruc] || 'bg-gray-50 border-gray-200'} ${onSelectItem ? 'cursor-pointer hover:opacity-90' : ''}`}
                onClick={() => onSelectItem?.(item)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm">{item.CaTruc}</span>
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[item.TrangThai] || 'bg-gray-400'}`} />
                    <span className="text-xs font-medium opacity-80">{item.TrangThai}</span>
                  </div>
                  {showDoctor && (
                    <p className="text-sm font-medium truncate">{item.TenBacSi || 'N/A'}{item.ChuyenKhoa ? ` · ${item.ChuyenKhoa}` : ''}</p>
                  )}
                  <p className="text-xs opacity-80 truncate">
                    {item.TenPhong || 'Chưa chọn phòng'}
                    {item.GhiChu ? ` · ${item.GhiChu}` : ''}
                  </p>
                </div>
                <span className="text-xs font-mono opacity-60 shrink-0">#{item.MaLichTruc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
