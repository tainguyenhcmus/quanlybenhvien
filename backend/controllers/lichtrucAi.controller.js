// backend/controllers/lichtrucAi.controller.js
const fetch = require('node-fetch');
const pool = require('../db');
const {
  taoThongBao,
  getMaTaiKhoanBacSi,
  ghiLichSu,
} = require('../services/notify.service');

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const VALID_CA = ['Sáng', 'Chiều', 'Đêm'];
const VALID_STATUS = ['Chờ duyệt', 'Đã duyệt', 'Từ chối'];
const OVERLOAD_THRESHOLD = 5;

function toYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYmd(s) {
  const [y, m, d] = String(s).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function defaultRange() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  return { from: toYmd(from), to: toYmd(to) };
}

function eachDate(fromStr, toStr) {
  const dates = [];
  const cur = parseYmd(fromStr);
  const end = parseYmd(toStr);
  if (!cur || !end || cur > end) return dates;
  while (cur <= end) {
    dates.push(toYmd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

async function callOpenAI(systemPrompt, messages) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('Chưa cấu hình OPENAI_API_KEY trên server');
    err.status = 503;
    throw err;
  }

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
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error('OpenAI error:', resp.status, errText);
    const err = new Error('Lỗi kết nối AI');
    err.status = 502;
    throw err;
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content;
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    const err = new Error('Phản hồi AI không hợp lệ');
    err.status = 502;
    throw err;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    const err = new Error('Phản hồi AI không đúng định dạng');
    err.status = 502;
    throw err;
  }
  return parsed;
}

async function loadSnapshot(from, to) {
  const [bacSi] = await pool.execute(
    'SELECT MaBacSi, HoTen, ChuyenKhoa FROM BacSi ORDER BY HoTen'
  );
  const [phong] = await pool.execute(
    'SELECT MaPhong, TenPhong FROM PhongKham ORDER BY MaPhong'
  );
  const [lich] = await pool.execute(
    `SELECT lt.MaLichTruc, DATE_FORMAT(lt.NgayTruc, '%Y-%m-%d') AS NgayTruc, lt.CaTruc, lt.TrangThai, lt.GhiChu,
            bs.MaBacSi, bs.HoTen AS TenBacSi, bs.ChuyenKhoa,
            pk.MaPhong, pk.TenPhong
     FROM LichTruc lt
     LEFT JOIN BacSi bs ON lt.MaBacSi = bs.MaBacSi
     LEFT JOIN PhongKham pk ON lt.MaPhong = pk.MaPhong
     WHERE lt.NgayTruc BETWEEN ? AND ?
     ORDER BY lt.NgayTruc ASC, FIELD(lt.CaTruc, 'Sáng', 'Chiều', 'Đêm'), bs.HoTen`,
    [from, to]
  );
  return { bacSi, phong, lich };
}

function analyzeSnapshot({ bacSi, lich }, from, to) {
  const dates = eachDate(from, to);
  const approved = lich.filter((x) => x.TrangThai === 'Đã duyệt');
  const pending = lich.filter((x) => x.TrangThai === 'Chờ duyệt');

  const filled = new Set(approved.map((x) => `${x.NgayTruc}|${x.CaTruc}`));
  const emptySlots = [];
  for (const ngay of dates) {
    for (const ca of VALID_CA) {
      if (!filled.has(`${ngay}|${ca}`)) {
        emptySlots.push({ NgayTruc: ngay, CaTruc: ca });
      }
    }
  }

  const withShift = new Set(lich.map((x) => x.MaBacSi).filter(Boolean));
  const doctorsWithoutShift = bacSi
    .filter((b) => !withShift.has(b.MaBacSi))
    .map((b) => ({
      MaBacSi: b.MaBacSi,
      TenBacSi: b.HoTen,
      ChuyenKhoa: b.ChuyenKhoa || null,
    }));

  const countByDoctor = new Map();
  for (const row of approved) {
    if (!row.MaBacSi) continue;
    const prev = countByDoctor.get(row.MaBacSi) || {
      MaBacSi: row.MaBacSi,
      TenBacSi: row.TenBacSi,
      ChuyenKhoa: row.ChuyenKhoa,
      soCa: 0,
      chiTiet: [],
    };
    prev.soCa += 1;
    prev.chiTiet.push({ NgayTruc: row.NgayTruc, CaTruc: row.CaTruc });
    countByDoctor.set(row.MaBacSi, prev);
  }
  const overloaded = [...countByDoctor.values()]
    .filter((d) => d.soCa >= OVERLOAD_THRESHOLD)
    .sort((a, b) => b.soCa - a.soCa);

  const specialties = [
    ...new Set(bacSi.map((b) => b.ChuyenKhoa).filter((k) => k && String(k).trim())),
  ];
  const missingBySpecialty = [];
  for (const khoa of specialties) {
    for (const ngay of dates) {
      for (const ca of VALID_CA) {
        const has = approved.some(
          (x) => x.NgayTruc === ngay && x.CaTruc === ca && x.ChuyenKhoa === khoa
        );
        if (!has) {
          missingBySpecialty.push({ NgayTruc: ngay, CaTruc: ca, ChuyenKhoa: khoa });
        }
      }
    }
  }

  return {
    from,
    to,
    totals: {
      soBacSi: bacSi.length,
      soCaTrongKy: lich.length,
      soCaDaDuyet: approved.length,
      soCaChoDuyet: pending.length,
      soSlotTrong: emptySlots.length,
      soBacSiChuaCoCa: doctorsWithoutShift.length,
      soBacSiQuaTai: overloaded.length,
    },
    emptySlots: emptySlots.slice(0, 40),
    doctorsWithoutShift,
    overloaded,
    pending: pending.slice(0, 30).map((p) => ({
      MaLichTruc: p.MaLichTruc,
      MaBacSi: p.MaBacSi,
      TenBacSi: p.TenBacSi,
      NgayTruc: p.NgayTruc,
      CaTruc: p.CaTruc,
    })),
    missingBySpecialtyCount: missingBySpecialty.length,
    missingBySpecialty: missingBySpecialty.slice(0, 30),
    thresholdQuaTai: OVERLOAD_THRESHOLD,
  };
}

async function tongQuan(req, res) {
  try {
    const def = defaultRange();
    const from = req.query.from || def.from;
    const to = req.query.to || def.to;
    if (!parseYmd(from) || !parseYmd(to) || parseYmd(from) > parseYmd(to)) {
      return res.status(400).json({ message: 'Khoảng ngày không hợp lệ (from/to = YYYY-MM-DD)' });
    }

    const snapshot = await loadSnapshot(from, to);
    const analysis = analyzeSnapshot(snapshot, from, to);

    let summary =
      `Từ ${from} đến ${to}: ${analysis.totals.soCaDaDuyet} ca đã duyệt, ` +
      `${analysis.totals.soSlotTrong} slot trống, ` +
      `${analysis.totals.soBacSiChuaCoCa} bác sĩ chưa có ca, ` +
      `${analysis.totals.soBacSiQuaTai} bác sĩ quá tải (≥${OVERLOAD_THRESHOLD} ca).`;

    if (process.env.OPENAI_API_KEY) {
      try {
        const parsed = await callOpenAI(
          `Bạn là trợ lý quản lý lịch trực bệnh viện. Trả lời tiếng Việt, ngắn gọn.
Dựa trên dữ liệu phân tích từ DB, viết tóm tắt hành động được ưu tiên.
Trả JSON: { "summary": "2-4 câu tiếng Việt", "highlights": ["điểm 1","điểm 2","điểm 3"] }`,
          [
            {
              role: 'user',
              content: `Phân tích lịch trực:\n${JSON.stringify({
                from,
                to,
                totals: analysis.totals,
                emptySlotsSample: analysis.emptySlots.slice(0, 12),
                doctorsWithoutShift: analysis.doctorsWithoutShift.slice(0, 15),
                overloaded: analysis.overloaded.slice(0, 10),
                pendingCount: analysis.totals.soCaChoDuyet,
                missingBySpecialtyCount: analysis.missingBySpecialtyCount,
              })}`,
            },
          ]
        );
        if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
          summary = parsed.summary.trim();
        }
        const highlights = Array.isArray(parsed.highlights)
          ? parsed.highlights.filter((h) => typeof h === 'string').slice(0, 5)
          : [];
        return res.json({ ...analysis, summary, highlights, ai: true });
      } catch (aiErr) {
        console.error('tongQuan AI fallback:', aiErr.message);
      }
    }

    res.json({
      ...analysis,
      summary,
      highlights: [
        analysis.totals.soSlotTrong
          ? `${analysis.totals.soSlotTrong} slot ngày/ca chưa có người trực`
          : 'Mọi slot ngày/ca đã có ít nhất 1 người',
        analysis.totals.soBacSiChuaCoCa
          ? `${analysis.totals.soBacSiChuaCoCa} bác sĩ chưa được xếp ca`
          : 'Mọi bác sĩ đều đã có ít nhất 1 ca',
        analysis.totals.soBacSiQuaTai
          ? `${analysis.totals.soBacSiQuaTai} bác sĩ ≥ ${OVERLOAD_THRESHOLD} ca trong kỳ`
          : 'Không có bác sĩ quá tải theo ngưỡng hiện tại',
      ],
      ai: false,
    });
  } catch (err) {
    console.error('tongQuan', err);
    res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
  }
}

function emptyDraft() {
  return {
    action: null,
    MaLichTruc: null,
    MaBacSi: null,
    MaPhong: null,
    NgayTruc: null,
    CaTruc: null,
    TrangThai: null,
    GhiChu: null,
  };
}

function sanitizeDraft(d) {
  const out = { ...emptyDraft(), ...(d || {}) };
  if (out.MaLichTruc != null && out.MaLichTruc !== '') out.MaLichTruc = Number(out.MaLichTruc);
  else out.MaLichTruc = null;
  if (out.MaBacSi != null && out.MaBacSi !== '') out.MaBacSi = Number(out.MaBacSi);
  else out.MaBacSi = null;
  if (out.MaPhong != null && out.MaPhong !== '') out.MaPhong = Number(out.MaPhong);
  else out.MaPhong = null;
  if (out.NgayTruc && !/^\d{4}-\d{2}-\d{2}$/.test(String(out.NgayTruc).slice(0, 10))) {
    out.NgayTruc = null;
  } else if (out.NgayTruc) {
    out.NgayTruc = String(out.NgayTruc).slice(0, 10);
  } else {
    out.NgayTruc = null;
  }
  if (out.CaTruc && !VALID_CA.includes(out.CaTruc)) out.CaTruc = null;
  if (out.TrangThai && !VALID_STATUS.includes(out.TrangThai)) out.TrangThai = null;
  if (!['create', 'update', 'delete', 'approve', 'reject'].includes(out.action)) {
    out.action = null;
  }
  if (Number.isNaN(out.MaLichTruc)) out.MaLichTruc = null;
  if (Number.isNaN(out.MaBacSi)) out.MaBacSi = null;
  if (Number.isNaN(out.MaPhong)) out.MaPhong = null;
  return out;
}

function mergeDraft(partial, ai) {
  const out = { ...emptyDraft(), ...(partial || {}) };
  if (!ai || typeof ai !== 'object') return sanitizeDraft(out);

  if (ai.action !== undefined) {
    const a = ai.action === '' || ai.action === 'none' ? null : ai.action;
    out.action = a;
  }
  if (ai.MaLichTruc != null && ai.MaLichTruc !== '' && !Number.isNaN(Number(ai.MaLichTruc))) {
    out.MaLichTruc = Number(ai.MaLichTruc);
  }
  if (ai.MaBacSi != null && ai.MaBacSi !== '' && !Number.isNaN(Number(ai.MaBacSi))) {
    out.MaBacSi = Number(ai.MaBacSi);
  }
  if (ai.MaPhong != null && ai.MaPhong !== '' && !Number.isNaN(Number(ai.MaPhong))) {
    out.MaPhong = Number(ai.MaPhong);
  }
  if (ai.NgayTruc && String(ai.NgayTruc).trim()) {
    out.NgayTruc = String(ai.NgayTruc).trim().slice(0, 10);
  }
  if (ai.CaTruc && VALID_CA.includes(ai.CaTruc)) out.CaTruc = ai.CaTruc;
  if (ai.TrangThai && VALID_STATUS.includes(ai.TrangThai)) out.TrangThai = ai.TrangThai;
  if (ai.GhiChu != null) out.GhiChu = String(ai.GhiChu).trim() || null;

  return sanitizeDraft(out);
}

function draftMissing(draft) {
  if (!draft?.action) return [];
  if (draft.action === 'create') {
    const m = [];
    if (draft.MaBacSi == null) m.push('MaBacSi');
    if (!draft.NgayTruc) m.push('NgayTruc');
    if (!draft.CaTruc) m.push('CaTruc');
    return m;
  }
  if (draft.action === 'update') {
    const m = [];
    if (draft.MaLichTruc == null) m.push('MaLichTruc');
    if (draft.MaBacSi == null) m.push('MaBacSi');
    if (!draft.NgayTruc) m.push('NgayTruc');
    if (!draft.CaTruc) m.push('CaTruc');
    if (!draft.TrangThai) m.push('TrangThai');
    return m;
  }
  if (['delete', 'approve', 'reject'].includes(draft.action)) {
    return draft.MaLichTruc == null ? ['MaLichTruc'] : [];
  }
  return [];
}

async function chat(req, res) {
  try {
    const { messages, draft, from: bodyFrom, to: bodyTo } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Thiếu tin nhắn' });
    }

    const def = defaultRange();
    const from = bodyFrom || def.from;
    const to = bodyTo || def.to;
    const snapshot = await loadSnapshot(from, to);
    const analysis = analyzeSnapshot(snapshot, from, to);

    const catalogText = [
      `Khoảng phân tích: ${from} → ${to}`,
      '',
      'BÁC SĨ:',
      ...snapshot.bacSi.map(
        (b) =>
          `- MaBacSi=${b.MaBacSi}: ${b.HoTen}${b.ChuyenKhoa ? ` (${b.ChuyenKhoa})` : ''}`
      ),
      '',
      'PHÒNG KHÁM:',
      ...snapshot.phong.map((p) => `- MaPhong=${p.MaPhong}: ${p.TenPhong}`),
      '',
      'LỊCH TRỰC TRONG KỲ (rút gọn):',
      ...snapshot.lich.slice(0, 80).map(
        (l) =>
          `- #${l.MaLichTruc}: ${l.TenBacSi} (MaBacSi=${l.MaBacSi}) ${l.NgayTruc} ${l.CaTruc} [${l.TrangThai}]` +
          (l.MaPhong ? ` phòng=${l.MaPhong}` : '')
      ),
      snapshot.lich.length > 80 ? `... và ${snapshot.lich.length - 80} ca khác` : '',
      '',
      'TỔNG QUAN:',
      JSON.stringify(analysis.totals),
      'Slot trống (sample):',
      JSON.stringify(analysis.emptySlots.slice(0, 15)),
      'BS chưa có ca:',
      JSON.stringify(analysis.doctorsWithoutShift.slice(0, 15)),
      'BS quá tải:',
      JSON.stringify(analysis.overloaded.slice(0, 10)),
    ].join('\n');

    const systemPrompt = `Bạn là trợ lý admin quản lý lịch trực. Trả lời tiếng Việt, ngắn gọn, dựa trên dữ liệu DB bên dưới.

${catalogText}

Ca hợp lệ: Sáng | Chiều | Đêm
Trạng thái: Chờ duyệt | Đã duyệt | Từ chối

Nhiệm vụ: hội thoại + điền bản nháp thao tác (draft) để admin xác nhận trước khi ghi DB.
action:
- create: xếp ca mới (cần MaBacSi, NgayTruc YYYY-MM-DD, CaTruc; MaPhong/GhiChu tùy chọn; TrangThai mặc định Đã duyệt)
- update: sửa ca (#MaLichTruc + MaBacSi, NgayTruc, CaTruc, TrangThai, MaPhong?, GhiChu?)
- delete: xóa ca (#MaLichTruc)
- approve: duyệt ca chờ (#MaLichTruc)
- reject: từ chối ca (#MaLichTruc)
- null: chỉ trả lời / hỏi thêm, không đề xuất thao tác

Trả JSON đúng khóa:
{
  "reply": "string",
  "action": "create"|"update"|"delete"|"approve"|"reject"|null,
  "MaLichTruc": number|null,
  "MaBacSi": number|null,
  "MaPhong": number|null,
  "NgayTruc": "YYYY-MM-DD"|null,
  "CaTruc": "Sáng"|"Chiều"|"Đêm"|null,
  "TrangThai": "Chờ duyệt"|"Đã duyệt"|"Từ chối"|null,
  "GhiChu": string|null
}

Chỉ dùng MaBacSi/MaPhong/MaLichTruc có trong danh sách. Bản nháp hiện tại: ${JSON.stringify(draft || {})}`;

    const parsed = await callOpenAI(systemPrompt, messages.slice(-16));
    let merged = mergeDraft(draft || {}, parsed);

    if (merged.MaBacSi != null && !snapshot.bacSi.some((b) => b.MaBacSi === merged.MaBacSi)) {
      merged.MaBacSi = null;
    }
    if (merged.MaPhong != null && !snapshot.phong.some((p) => p.MaPhong === merged.MaPhong)) {
      merged.MaPhong = null;
    }
    if (
      merged.MaLichTruc != null &&
      !snapshot.lich.some((l) => l.MaLichTruc === merged.MaLichTruc)
    ) {
      const [exist] = await pool.execute(
        'SELECT MaLichTruc FROM LichTruc WHERE MaLichTruc = ? LIMIT 1',
        [merged.MaLichTruc]
      );
      if (!exist.length) merged.MaLichTruc = null;
    }

    if (merged.action === 'create' && !merged.TrangThai) merged.TrangThai = 'Đã duyệt';
    if (merged.action === 'approve') merged.TrangThai = 'Đã duyệt';
    if (merged.action === 'reject') merged.TrangThai = 'Từ chối';

    const missing = draftMissing(merged);
    const reply =
      (typeof parsed.reply === 'string' && parsed.reply.trim()) ||
      (missing.length
        ? `Còn thiếu: ${missing.join(', ')}. Hãy bổ sung trong chat hoặc chỉnh ở phần cài đặt.`
        : merged.action
          ? 'Đã đủ thông tin. Bạn có thể bấm Áp dụng thay đổi.'
          : 'Bạn muốn tạo, sửa, xóa hay duyệt ca nào?');

    res.json({
      reply,
      draft: merged,
      missing,
      ready: Boolean(merged.action) && missing.length === 0,
      overviewHint: analysis.totals,
    });
  } catch (err) {
    console.error('lichtrucAi.chat', err);
    res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
  }
}

async function applyDraft(req, res) {
  try {
    const draft = sanitizeDraft(req.body?.draft || {});
    const missing = draftMissing(draft);
    if (!draft.action) {
      return res.status(400).json({ message: 'Chưa có thao tác để áp dụng' });
    }
    if (missing.length) {
      return res.status(400).json({ message: `Thiếu trường: ${missing.join(', ')}` });
    }

    const actor = req.user?.MaTaiKhoan;

    if (draft.action === 'create') {
      const [result] = await pool.execute(
        `INSERT INTO LichTruc (MaBacSi, MaPhong, NgayTruc, CaTruc, TrangThai, GhiChu)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          draft.MaBacSi,
          draft.MaPhong || null,
          draft.NgayTruc,
          draft.CaTruc,
          draft.TrangThai || 'Đã duyệt',
          draft.GhiChu || null,
        ]
      );
      const id = result.insertId;
      await ghiLichSu({
        MaLichTruc: id,
        LoaiHanhDong: 'TaoMoi',
        MoTa: `AI/Admin tạo lịch trực ${draft.NgayTruc} ca ${draft.CaTruc}`,
        MaTaiKhoan: actor,
      });
      const maTkBs = await getMaTaiKhoanBacSi(draft.MaBacSi);
      if (maTkBs) {
        await taoThongBao({
          MaTaiKhoan: maTkBs,
          TieuDe: 'Được xếp lịch trực',
          NoiDung: `Bạn được xếp trực ngày ${draft.NgayTruc} - ca ${draft.CaTruc}`,
          Loai: 'LichTruc',
          MaLienKet: id,
        });
      }
      return res.json({ message: 'Đã tạo lịch trực', id, draft });
    }

    if (draft.action === 'update') {
      await pool.execute(
        `UPDATE LichTruc SET MaBacSi = ?, MaPhong = ?, NgayTruc = ?, CaTruc = ?, TrangThai = ?, GhiChu = ?
         WHERE MaLichTruc = ?`,
        [
          draft.MaBacSi,
          draft.MaPhong || null,
          draft.NgayTruc,
          draft.CaTruc,
          draft.TrangThai,
          draft.GhiChu || null,
          draft.MaLichTruc,
        ]
      );
      await ghiLichSu({
        MaLichTruc: draft.MaLichTruc,
        LoaiHanhDong: 'CapNhat',
        MoTa: `AI/Admin cập nhật lịch trực #${draft.MaLichTruc}`,
        MaTaiKhoan: actor,
      });
      return res.json({ message: 'Đã cập nhật lịch trực', draft });
    }

    if (draft.action === 'delete') {
      const [rows] = await pool.execute(
        `SELECT MaBacSi, DATE_FORMAT(NgayTruc, '%Y-%m-%d') AS NgayTruc, CaTruc FROM LichTruc WHERE MaLichTruc = ?`,
        [draft.MaLichTruc]
      );
      await ghiLichSu({
        MaLichTruc: draft.MaLichTruc,
        LoaiHanhDong: 'Xoa',
        MoTa: `AI/Admin xóa lịch trực #${draft.MaLichTruc}`,
        MaTaiKhoan: actor,
      });
      await pool.execute('DELETE FROM LichTruc WHERE MaLichTruc = ?', [draft.MaLichTruc]);
      if (rows[0]) {
        const maTkBs = await getMaTaiKhoanBacSi(rows[0].MaBacSi);
        if (maTkBs && maTkBs !== actor) {
          await taoThongBao({
            MaTaiKhoan: maTkBs,
            TieuDe: 'Ca trực đã bị hủy',
            NoiDung: `Ca trực ${rows[0].NgayTruc} - ${rows[0].CaTruc} đã bị xóa`,
            Loai: 'LichTruc',
            MaLienKet: null,
          });
        }
      }
      return res.json({ message: 'Đã xóa lịch trực', draft });
    }

    if (draft.action === 'approve' || draft.action === 'reject') {
      const TrangThai = draft.action === 'approve' ? 'Đã duyệt' : 'Từ chối';
      const [rows] = await pool.execute(
        `SELECT MaBacSi, DATE_FORMAT(NgayTruc, '%Y-%m-%d') AS NgayTruc, CaTruc FROM LichTruc WHERE MaLichTruc = ?`,
        [draft.MaLichTruc]
      );
      if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy lịch trực' });
      await pool.execute('UPDATE LichTruc SET TrangThai = ? WHERE MaLichTruc = ?', [
        TrangThai,
        draft.MaLichTruc,
      ]);
      await ghiLichSu({
        MaLichTruc: draft.MaLichTruc,
        LoaiHanhDong: draft.action === 'approve' ? 'Duyet' : 'TuChoi',
        MoTa: `AI/Admin ${TrangThai} ca #${draft.MaLichTruc}`,
        MaTaiKhoan: actor,
      });
      const maTkBs = await getMaTaiKhoanBacSi(rows[0].MaBacSi);
      if (maTkBs) {
        await taoThongBao({
          MaTaiKhoan: maTkBs,
          TieuDe: TrangThai === 'Đã duyệt' ? 'Ca trực đã được duyệt' : 'Ca trực bị từ chối',
          NoiDung: `Ca trực ${rows[0].NgayTruc} - ${rows[0].CaTruc}: ${TrangThai}`,
          Loai: 'LichTruc',
          MaLienKet: draft.MaLichTruc,
        });
      }
      return res.json({ message: `Đã cập nhật: ${TrangThai}`, draft: { ...draft, TrangThai } });
    }

    return res.status(400).json({ message: 'Thao tác không hỗ trợ' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Bác sĩ đã có ca trực này trong ngày đã chọn' });
    }
    console.error('lichtrucAi.apply', err);
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
}

module.exports = { tongQuan, chat, applyDraft };
