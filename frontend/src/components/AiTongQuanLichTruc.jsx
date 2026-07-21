import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  FaRobot,
  FaPaperPlane,
  FaSync,
  FaUserMd,
  FaHospital,
  FaClock,
  FaExclamationTriangle,
  FaCheck,
  FaCalendarAlt,
} from 'react-icons/fa';
import { formatDateVN } from '../utils/date';

const EMPTY_DRAFT = {
  action: null,
  MaLichTruc: null,
  MaBacSi: null,
  MaPhong: null,
  NgayTruc: null,
  CaTruc: null,
  TrangThai: null,
  GhiChu: null,
};

function toYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultRange() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  return { from: toYmd(from), to: toYmd(to) };
}

const ACTION_LABELS = {
  create: 'Tạo ca mới',
  update: 'Cập nhật ca',
  delete: 'Xóa ca',
  approve: 'Duyệt ca',
  reject: 'Từ chối ca',
};

/** Hiệu ứng chữ chạy (typewriter) — chạy lại mỗi khi `text` đổi */
function TypewriterText({ text, className = '', speed = 18, onDone }) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const full = text || '';
    setShown('');
    setDone(false);
    if (!full) {
      setDone(true);
      return undefined;
    }

    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      // nhảy vài ký tự khi chuỗi dài để không quá chậm
      const step = full.length > 280 ? 3 : full.length > 140 ? 2 : 1;
      i = Math.min(full.length, i + step - 1);
      setShown(full.slice(0, i));
      if (i >= full.length) {
        setDone(true);
        if (onDoneRef.current) onDoneRef.current();
        return;
      }
      timer = window.setTimeout(tick, speed);
    };
    let timer = window.setTimeout(tick, speed);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [text, speed]);

  return (
    <p className={className}>
      <span className="whitespace-pre-wrap">{shown}</span>
      {!done && (
        <span
          className="ml-0.5 inline-block w-[2px] h-[1em] align-[-0.15em] bg-teal-500 animate-pulse"
          aria-hidden
        />
      )}
    </p>
  );
}

export default function AiTongQuanLichTruc({ doctors = [], phongKham = [], onChanged }) {
  const init = defaultRange();
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào! Tôi đã đọc lịch trực trên DB. Hỏi về slot trống, bác sĩ chưa xếp ca, thiếu ca hoặc quá tải — hoặc nhờ tôi đề xuất tạo/sửa/duyệt ca (bạn chỉnh ở phần Cài đặt rồi Áp dụng).',
    },
  ]);
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [sending, setSending] = useState(false);
  const [applying, setApplying] = useState(false);
  const scrollRef = useRef(null);

  const loadOverview = useCallback(async () => {
    if (!from || !to) return;
    setLoadingOverview(true);
    try {
      const { data } = await api.get('/lichtruc/ai/tong-quan', {
        params: { from, to },
        timeout: 90000,
      });
      setOverview(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không tải được tổng quan AI');
    } finally {
      setLoadingOverview(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const buildApiMessages = (hist) =>
    hist
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content }));

  const sendUserMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setSending(true);
    try {
      const { data } = await api.post(
        '/lichtruc/ai/chat',
        { messages: buildApiMessages(nextMessages), draft, from, to },
        { timeout: 90000 }
      );
      setDraft(data.draft || EMPTY_DRAFT);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không gọi được trợ lý AI');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Có lỗi khi gọi AI. Bạn có thể chỉnh trực tiếp phần Cài đặt bên dưới.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const missing = useMemo(() => {
    if (!draft.action) return [];
    if (draft.action === 'create') {
      const m = [];
      if (draft.MaBacSi == null) m.push('bác sĩ');
      if (!draft.NgayTruc) m.push('ngày trực');
      if (!draft.CaTruc) m.push('ca trực');
      return m;
    }
    if (draft.action === 'update') {
      const m = [];
      if (draft.MaLichTruc == null) m.push('mã lịch');
      if (draft.MaBacSi == null) m.push('bác sĩ');
      if (!draft.NgayTruc) m.push('ngày trực');
      if (!draft.CaTruc) m.push('ca trực');
      if (!draft.TrangThai) m.push('trạng thái');
      return m;
    }
    if (['delete', 'approve', 'reject'].includes(draft.action) && draft.MaLichTruc == null) {
      return ['mã lịch'];
    }
    return [];
  }, [draft]);

  const ready = Boolean(draft.action) && missing.length === 0;

  const handleApply = async () => {
    if (!ready || applying) return;
    setApplying(true);
    try {
      const { data } = await api.post('/lichtruc/ai/apply', { draft });
      toast.success(data.message || 'Đã áp dụng');
      setDraft(EMPTY_DRAFT);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${data.message || 'Đã áp dụng'}. Bạn có thể tiếp tục yêu cầu điều chỉnh khác.`,
        },
      ]);
      await loadOverview();
      if (onChanged) onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Áp dụng thất bại');
    } finally {
      setApplying(false);
    }
  };

  const totals = overview?.totals;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaRobot className="text-white text-xl" />
              </div>
              AI tổng quan lịch trực
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Đọc DB → thống kê slot trống, bác sĩ chưa xếp ca, thiếu ca, quá tải. Chat để đề xuất cập nhật.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-gray-600">
              Từ
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 block rounded-lg border-2 border-gray-200 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-600">
              Đến
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 block rounded-lg border-2 border-gray-200 px-2 py-1.5 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={loadOverview}
              disabled={loadingOverview}
              className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <FaSync className={loadingOverview ? 'animate-spin' : ''} />
              Phân tích
            </button>
          </div>
        </div>

        {loadingOverview && !overview ? (
          <p className="text-sm text-gray-500 py-6 text-center">Đang đọc DB và phân tích…</p>
        ) : overview ? (
          <>
            <div className="rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50/80 to-cyan-50/50 p-4">
              <TypewriterText
                key={`${overview.from}-${overview.to}-${overview.summary}`}
                text={overview.summary || ''}
                speed={16}
                className="text-sm text-gray-800 leading-relaxed"
              />
              {overview.highlights?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {overview.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-teal-900 flex gap-2">
                      <span className="text-teal-500">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[11px] text-gray-500">
                {overview.ai ? 'Tóm tắt bởi AI' : 'Tóm tắt từ số liệu DB'} · ngưỡng quá tải ≥{' '}
                {overview.thresholdQuaTai} ca
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Đã duyệt', value: totals?.soCaDaDuyet, tone: 'text-emerald-700 bg-emerald-50' },
                { label: 'Chờ duyệt', value: totals?.soCaChoDuyet, tone: 'text-amber-700 bg-amber-50' },
                { label: 'Slot trống', value: totals?.soSlotTrong, tone: 'text-rose-700 bg-rose-50' },
                { label: 'BS chưa có ca', value: totals?.soBacSiChuaCoCa, tone: 'text-orange-700 bg-orange-50' },
                { label: 'BS quá tải', value: totals?.soBacSiQuaTai, tone: 'text-indigo-700 bg-indigo-50' },
                { label: 'Thiếu phủ CK', value: overview.missingBySpecialtyCount, tone: 'text-slate-700 bg-slate-50' },
              ].map((c) => (
                <div key={c.label} className={`rounded-xl px-3 py-3 ${c.tone}`}>
                  <p className="text-[11px] font-medium opacity-80">{c.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{c.value ?? '—'}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <DetailList
                title="Slot trống (ngày · ca)"
                icon={<FaCalendarAlt className="text-rose-500" />}
                empty="Không có slot trống trong kỳ"
                items={(overview.emptySlots || []).map(
                  (s) => `${formatDateVN(s.NgayTruc)} · ${s.CaTruc}`
                )}
              />
              <DetailList
                title="Bác sĩ chưa có ca"
                icon={<FaUserMd className="text-orange-500" />}
                empty="Mọi bác sĩ đã có ít nhất 1 ca"
                items={(overview.doctorsWithoutShift || []).map(
                  (d) => `${d.TenBacSi}${d.ChuyenKhoa ? ` — ${d.ChuyenKhoa}` : ''}`
                )}
              />
              <DetailList
                title="Bác sĩ quá tải"
                icon={<FaExclamationTriangle className="text-indigo-500" />}
                empty="Không ai vượt ngưỡng"
                items={(overview.overloaded || []).map(
                  (d) => `${d.TenBacSi}: ${d.soCa} ca`
                )}
              />
            </div>
          </>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-4 pt-2">
          <div className="flex min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
            <div className="shrink-0 border-b border-teal-100/70 bg-gradient-to-r from-teal-50/90 to-white px-4 py-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FaRobot className="text-teal-600" /> Chat điều chỉnh lịch trực
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ví dụ: &quot;Xếp BS An ca Sáng ngày mai&quot; / &quot;Duyệt ca #12&quot;
              </p>
            </div>
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3 bg-slate-50/40">
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        m.role === 'user'
                          ? 'rounded-br-md bg-teal-600 text-white'
                          : 'rounded-bl-md border border-gray-200/80 bg-white text-gray-800'
                      }`}
                    >
                      <span className="whitespace-pre-wrap break-words">{m.content}</span>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
                      Đang phân tích DB…
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendUserMessage())}
                placeholder="Nhập yêu cầu…"
                className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-white"
                disabled={sending}
              />
              <button
                type="button"
                onClick={sendUserMessage}
                disabled={sending || !input.trim()}
                className="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-white disabled:opacity-45"
                aria-label="Gửi"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800">Cài đặt thao tác</p>
              {draft.action && (
                <span className="text-xs font-medium px-2 py-1 rounded-lg bg-teal-100 text-teal-800">
                  {ACTION_LABELS[draft.action] || draft.action}
                </span>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Thao tác</label>
              <select
                value={draft.action || ''}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    action: e.target.value || null,
                    TrangThai:
                      e.target.value === 'approve'
                        ? 'Đã duyệt'
                        : e.target.value === 'reject'
                          ? 'Từ chối'
                          : e.target.value === 'create'
                            ? d.TrangThai || 'Đã duyệt'
                            : d.TrangThai,
                  }))
                }
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">— Không thao tác —</option>
                <option value="create">Tạo ca mới</option>
                <option value="update">Cập nhật ca</option>
                <option value="delete">Xóa ca</option>
                <option value="approve">Duyệt ca</option>
                <option value="reject">Từ chối ca</option>
              </select>
            </div>

            {['update', 'delete', 'approve', 'reject'].includes(draft.action) && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Mã lịch trực</label>
                <input
                  type="number"
                  value={draft.MaLichTruc ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      MaLichTruc: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm"
                  placeholder="VD: 12"
                />
              </div>
            )}

            {['create', 'update'].includes(draft.action) && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    <FaUserMd className="inline mr-1" />
                    Bác sĩ
                  </label>
                  <select
                    value={draft.MaBacSi ?? ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        MaBacSi: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">-- Chọn --</option>
                    {doctors.map((bs) => (
                      <option key={bs.MaBacSi} value={bs.MaBacSi}>
                        {bs.HoTen}
                        {bs.ChuyenKhoa ? ` — ${bs.ChuyenKhoa}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    <FaHospital className="inline mr-1" />
                    Phòng / khoa
                  </label>
                  <select
                    value={draft.MaPhong ?? ''}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        MaPhong: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">-- Không bắt buộc --</option>
                    {phongKham.map((pk) => (
                      <option key={pk.MaPhong} value={pk.MaPhong}>
                        {pk.TenPhong}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      <FaClock className="inline mr-1" />
                      Ngày trực
                    </label>
                    <input
                      type="date"
                      value={draft.NgayTruc || ''}
                      onChange={(e) => setDraft((d) => ({ ...d, NgayTruc: e.target.value || null }))}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Ca trực</label>
                    <select
                      value={draft.CaTruc || ''}
                      onChange={(e) => setDraft((d) => ({ ...d, CaTruc: e.target.value || null }))}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">-- Chọn --</option>
                      <option value="Sáng">Sáng</option>
                      <option value="Chiều">Chiều</option>
                      <option value="Đêm">Đêm</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {draft.action === 'update' && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Trạng thái</label>
                <select
                  value={draft.TrangThai || ''}
                  onChange={(e) => setDraft((d) => ({ ...d, TrangThai: e.target.value || null }))}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">-- Chọn --</option>
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                  <option value="Từ chối">Từ chối</option>
                </select>
              </div>
            )}

            {['create', 'update'].includes(draft.action) && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Ghi chú</label>
                <textarea
                  value={draft.GhiChu || ''}
                  onChange={(e) => setDraft((d) => ({ ...d, GhiChu: e.target.value || null }))}
                  rows={2}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm resize-y"
                />
              </div>
            )}

            {missing.length > 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
                Còn thiếu: {missing.join(', ')}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDraft(EMPTY_DRAFT)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Xóa nháp
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!ready || applying}
                className="flex-[1.4] rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 text-white px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
              >
                <FaCheck />
                {applying ? 'Đang áp dụng…' : 'Áp dụng thay đổi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailList({ title, icon, items, empty }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm max-h-48 overflow-y-auto">
      <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
        {icon}
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-gray-500">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 12).map((t, i) => (
            <li key={i} className="text-xs text-gray-700 border-b border-gray-50 pb-1 last:border-0">
              {t}
            </li>
          ))}
          {items.length > 12 && (
            <li className="text-[11px] text-gray-400">… và {items.length - 12} mục khác</li>
          )}
        </ul>
      )}
    </div>
  );
}
