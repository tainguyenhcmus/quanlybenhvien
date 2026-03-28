// backend/controllers/datlichChat.controller.js
const fetch = require('node-fetch');
const pool = require('../db');

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function loadCatalog() {
  const [bacSi] = await pool.execute(
    'SELECT MaBacSi, HoTen, ChuyenKhoa FROM BacSi ORDER BY MaBacSi'
  );
  const [phong] = await pool.execute(
    'SELECT MaPhong, TenPhong FROM PhongKham ORDER BY MaPhong'
  );
  return { bacSi, phong };
}

function mergeDraft(partial, ai) {
  if (!ai || typeof ai !== 'object') {
    return {
      MaBacSi: partial.MaBacSi != null ? Number(partial.MaBacSi) : null,
      MaPhong: partial.MaPhong != null ? Number(partial.MaPhong) : null,
      NgayKham: partial.NgayKham || null,
      GhiChu: partial.GhiChu != null ? partial.GhiChu : null,
    };
  }
  const out = {
    MaBacSi: partial.MaBacSi != null ? Number(partial.MaBacSi) : null,
    MaPhong: partial.MaPhong != null ? Number(partial.MaPhong) : null,
    NgayKham: partial.NgayKham || null,
    GhiChu: partial.GhiChu != null ? partial.GhiChu : null,
  };
  if (ai.MaBacSi != null && ai.MaBacSi !== '' && !Number.isNaN(Number(ai.MaBacSi))) {
    out.MaBacSi = Number(ai.MaBacSi);
  }
  if (ai.MaPhong != null && ai.MaPhong !== '' && !Number.isNaN(Number(ai.MaPhong))) {
    out.MaPhong = Number(ai.MaPhong);
  }
  if (ai.NgayKham && String(ai.NgayKham).trim()) {
    out.NgayKham = String(ai.NgayKham).trim();
  }
  if (ai.GhiChu != null && String(ai.GhiChu).trim() !== '') {
    out.GhiChu = String(ai.GhiChu).trim();
  }
  return out;
}

function normalizeNgayKham(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function chatExtract(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'Chưa cấu hình OPENAI_API_KEY trên server' });
  }
  try {
    const { messages, draft } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Thiếu tin nhắn' });
    }

    const { bacSi, phong } = await loadCatalog();
    if (bacSi.length === 0 || phong.length === 0) {
      return res.status(400).json({ message: 'Hệ thống chưa có danh sách bác sĩ hoặc phòng khám' });
    }

    const today = new Date().toISOString();
    const catalogText = [
      'DANH SÁCH BÁC SĨ (chỉ được chọn MaBacSi có trong danh sách):',
      ...bacSi.map(
        (b) =>
          `- MaBacSi=${b.MaBacSi}: ${b.HoTen}${b.ChuyenKhoa ? `, chuyên khoa: ${b.ChuyenKhoa}` : ''}`
      ),
      '',
      'DANH SÁCH PHÒNG KHÁM (chỉ được chọn MaPhong có trong danh sách):',
      ...phong.map((p) => `- MaPhong=${p.MaPhong}: ${p.TenPhong}`),
    ].join('\n');

    const systemPrompt = `Bạn là trợ lý đặt lịch khám bệnh viện, trả lời bằng tiếng Việt thân thiện, ngắn gọn.
Thời điểm tham chiếu (ISO UTC): ${today}

${catalogText}

Nhiệm vụ: Đọc hội thoại và bản nháp hiện tại, trích xuất thông tin đặt lịch:
- MaBacSi: số nguyên khớp danh sách, hoặc null
- MaPhong: số nguyên khớp danh sách, hoặc null
- NgayKham: chuỗi ISO 8601 (ví dụ 2026-03-28T09:00:00.000Z) nếu người dùng nêu ngày/giờ; ưu tiên diễn giải theo múi giờ Việt Nam (UTC+7); null nếu chưa rõ
- GhiChu: ghi chú thêm hoặc null

Trả về một object JSON với các khóa:
reply, MaBacSi, MaPhong, NgayKham, GhiChu, missing
"missing" là mảng các tên trường trong ["MaBacSi","MaPhong","NgayKham"] còn thiếu sau khi gộp với bản nháp.

Bản nháp hiện tại (JSON): ${JSON.stringify(draft || {})}`;

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .map((m) => ({ role: m.role, content: String(m.content) })),
    ];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openaiMessages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('OpenAI error:', resp.status, errText);
      return res.status(502).json({ message: 'Lỗi kết nối AI' });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(502).json({ message: 'Phản hồi AI không hợp lệ' });
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return res.status(502).json({ message: 'Phản hồi AI không đúng định dạng' });
    }

    let merged = mergeDraft(draft || {}, parsed);
    if (merged.MaBacSi != null && !bacSi.some((b) => b.MaBacSi === merged.MaBacSi)) {
      merged.MaBacSi = null;
    }
    if (merged.MaPhong != null && !phong.some((p) => p.MaPhong === merged.MaPhong)) {
      merged.MaPhong = null;
    }
    const normNgay = normalizeNgayKham(merged.NgayKham);
    if (merged.NgayKham && !normNgay) {
      merged.NgayKham = null;
    } else if (normNgay) {
      merged.NgayKham = normNgay;
    }

    const missing = [];
    if (merged.MaBacSi == null) missing.push('MaBacSi');
    if (merged.MaPhong == null) missing.push('MaPhong');
    if (!merged.NgayKham) missing.push('NgayKham');

    const reply =
      (typeof parsed.reply === 'string' && parsed.reply) ||
      (missing.length
        ? 'Vui lòng cho biết thêm: ' +
          missing.map((k) => ({ MaBacSi: 'bác sĩ', MaPhong: 'phòng khám', NgayKham: 'ngày giờ khám' }[k])).join(', ') +
          '.'
        : 'Đã đủ thông tin. Bạn có thể bấm Xác nhận đặt lịch.');

    res.json({
      reply,
      draft: merged,
      missing,
      ready: missing.length === 0,
    });
  } catch (err) {
    console.error('chatExtract', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

module.exports = { chatExtract };
