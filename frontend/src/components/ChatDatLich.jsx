import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaRobot, FaPaperPlane, FaCheck, FaUserMd, FaHospital, FaClock } from 'react-icons/fa';

function isoToDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const EMPTY_DRAFT = { MaBacSi: null, MaPhong: null, NgayKham: null, GhiChu: null };

export default function ChatDatLich({ onSuccess }) {
  const [bacSi, setBacSi] = useState([]);
  const [phongKham, setPhongKham] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào! Hãy cho tôi biết bạn muốn khám với bác sĩ nào, phòng/khoa nào và ngày giờ khám (ví dụ: "mai 9h với bác sĩ tim mạch, phòng tim mạch").',
    },
  ]);
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [bsRes, pkRes] = await Promise.all([api.get('/bacsi'), api.get('/phongkham')]);
        setBacSi(bsRes.data);
        setPhongKham(pkRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Không tải được danh sách bác sĩ / phòng khám');
      }
    })();
  }, []);

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
        '/lichkham/chat-extract',
        { messages: buildApiMessages(nextMessages), draft },
        { timeout: 60000 }
      );
      setDraft(data.draft || EMPTY_DRAFT);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không gọi được trợ lý AI';
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Rất tiếc, đã có lỗi xảy ra. Bạn thử lại hoặc điền tay ở phần bên dưới.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmitLich = async () => {
    if (draft.MaBacSi == null || draft.MaPhong == null || !draft.NgayKham) {
      toast.warning('Vui lòng cung đủ bác sĩ, phòng khám và ngày giờ (chat hoặc chọn tay).');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/lichkham', {
        MaBacSi: Number(draft.MaBacSi),
        MaPhong: Number(draft.MaPhong),
        NgayKham: draft.NgayKham,
        GhiChu: draft.GhiChu || null,
      });
      toast.success('Đặt lịch khám thành công!');
      setDraft(EMPTY_DRAFT);
      setMessages([
        {
          role: 'assistant',
          content:
            'Lịch đã được tạo. Bạn có thể tiếp tục mô tả nếu muốn đặt thêm lịch khác.',
        },
      ]);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đặt lịch thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const tenBs = bacSi.find((b) => b.MaBacSi === draft.MaBacSi)?.HoTen;
  const tenPk = phongKham.find((p) => p.MaPhong === draft.MaPhong)?.TenPhong;

  const missing = useMemo(() => {
    const m = [];
    if (draft.MaBacSi == null) m.push('MaBacSi');
    if (draft.MaPhong == null) m.push('MaPhong');
    if (!draft.NgayKham) m.push('NgayKham');
    return m;
  }, [draft]);

  const missingLabels = {
    MaBacSi: 'bác sĩ',
    MaPhong: 'phòng khám',
    NgayKham: 'ngày giờ khám',
  };

  return (
    <div
      className="flex w-full min-h-0 flex-col overflow-hidden rounded-2xl border border-purple-100/80 bg-white shadow-lg ring-1 ring-purple-500/10
        h-[min(85dvh,44rem)] max-h-[85dvh]
        lg:sticky lg:top-24 lg:self-start lg:h-[calc(100dvh-9rem)] lg:max-h-[calc(100dvh-9rem)]"
    >
      <div className="shrink-0 border-b border-purple-100/60 bg-gradient-to-r from-purple-50/90 to-white px-4 py-3 sm:px-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500 text-white shadow-md shadow-purple-500/25">
            <FaRobot className="text-lg" />
          </span>
          Trợ lý AI đặt lịch
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
          Mô tả yêu cầu bằng lời; AI gợi ý và hỏi thêm nếu thiếu bác sĩ, phòng hoặc ngày giờ.
        </p>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50/40">
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4"
        >
          <div className="mx-auto flex max-w-full flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[min(100%,20rem)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[85%] sm:text-[0.9375rem] ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-purple-600 text-white'
                      : 'rounded-bl-md border border-gray-200/80 bg-white text-gray-800'
                  }`}
                >
                  <span className="break-words whitespace-pre-wrap">{m.content}</span>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-gray-200/80 bg-white px-3.5 py-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
                    Đang phân tích…
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-200/80 bg-white px-3 py-3 sm:px-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendUserMessage())}
              placeholder="Nhập tin nhắn…"
              className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm outline-none transition-colors focus:border-purple-500 focus:bg-white"
              disabled={sending}
            />
            <button
              type="button"
              onClick={sendUserMessage}
              disabled={sending || !input.trim()}
              className="shrink-0 rounded-xl bg-purple-600 px-4 py-2.5 text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
              aria-label="Gửi tin nhắn"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="shrink-0 border-t border-amber-100 bg-amber-50/90 px-3 py-2.5 sm:px-4">
          <p className="text-sm leading-snug text-amber-900">
            <span className="font-semibold">Còn thiếu:</span>{' '}
            {missing.map((k) => missingLabels[k] || k).join(', ')} — trả lời trong chat hoặc chọn bên dưới.
          </p>
        </div>
      )}

      <div className="min-h-0 min-w-0 shrink overflow-y-auto overscroll-y-contain border-t border-gray-200/80 bg-gray-50/70 px-3 py-4 sm:px-4 max-h-[min(42dvh,20rem)] lg:max-h-[min(38vh,20rem)]">
        <p className="mb-3 text-sm font-semibold text-gray-800">Thông tin đặt lịch</p>
        <div className="space-y-3">

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            <FaUserMd className="mr-1 inline" />
            Bác sĩ
          </label>
          <select
            value={draft.MaBacSi ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setDraft((d) => ({ ...d, MaBacSi: v ? Number(v) : null }));
            }}
            className="w-full max-w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400"
          >
            <option value="">-- Chọn --</option>
            {bacSi.map((bs) => (
              <option key={bs.MaBacSi} value={bs.MaBacSi}>
                {bs.HoTen}
                {bs.ChuyenKhoa ? ` — ${bs.ChuyenKhoa}` : ''}
              </option>
            ))}
          </select>
          {tenBs && <p className="text-xs text-gray-500 mt-1">Đang chọn: {tenBs}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            <FaHospital className="mr-1 inline" />
            Phòng khám
          </label>
          <select
            value={draft.MaPhong ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setDraft((d) => ({ ...d, MaPhong: v ? Number(v) : null }));
            }}
            className="w-full max-w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400"
          >
            <option value="">-- Chọn --</option>
            {phongKham.map((pk) => (
              <option key={pk.MaPhong} value={pk.MaPhong}>
                {pk.TenPhong}
              </option>
            ))}
          </select>
          {tenPk && <p className="text-xs text-gray-500 mt-1">Đang chọn: {tenPk}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            <FaClock className="mr-1 inline" />
            Ngày giờ khám
          </label>
          <input
            type="datetime-local"
            value={isoToDatetimeLocal(draft.NgayKham)}
            onChange={(e) => {
              const iso = datetimeLocalToIso(e.target.value);
              setDraft((d) => ({ ...d, NgayKham: iso }));
            }}
            className="w-full max-w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Ghi chú</label>
          <textarea
            value={draft.GhiChu || ''}
            onChange={(e) => setDraft((d) => ({ ...d, GhiChu: e.target.value || null }))}
            rows={2}
            className="w-full max-w-full resize-y rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmitLich}
          disabled={submitting || draft.MaBacSi == null || draft.MaPhong == null || !draft.NgayKham}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          <FaCheck />
          {submitting ? 'Đang gửi…' : 'Xác nhận đặt lịch'}
        </button>
        </div>
      </div>
    </div>
  );
}
