/** Chuẩn hóa về YYYY-MM-DD theo lịch địa phương (tránh lệch UTC). */
export function toDateKey(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    // '2026-07-06' hoặc '2026-07-06 00:00:00'
    const m = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmed) && !trimmed.includes('T')) {
      return m[1];
    }
    // ISO có timezone: dùng thành phần ngày theo local
    const d = new Date(trimmed);
    if (!Number.isNaN(d.getTime())) return formatLocalYmd(d);
    return m ? m[1] : '';
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatLocalYmd(value);
  }

  return '';
}

function formatLocalYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Hiển thị ngày (DATE) dạng vi-VN, không lệch timezone. */
export function formatDateVN(value) {
  const key = toDateKey(value);
  if (!key) return '-';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('vi-VN');
}

/** Hiển thị datetime (có giờ) theo local. */
export function formatDateTimeVN(value) {
  if (!value) return '-';
  let normalized = value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} /.test(value)) {
    normalized = value.replace(' ', 'T');
  }
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('vi-VN');
}

/** Hôm nay YYYY-MM-DD theo local. */
export function todayKey() {
  return formatLocalYmd(new Date());
}
