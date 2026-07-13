/**
 * Gửi Email / SMS khi có thông báo.
 * Không cấu hình env → chỉ log (dev), không làm fail API.
 *
 * Email (SMTP):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *   SMTP_SECURE=true (nếu dùng 465)
 *
 * SMS (Twilio):
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 */
const pool = require('../db');
const fetch = require('node-fetch');

function emailEnabled() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function smsEnabled() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID
    && process.env.TWILIO_AUTH_TOKEN
    && process.env.TWILIO_FROM_NUMBER
  );
}

async function getContact(maTaiKhoan) {
  const [rows] = await pool.execute(
    `SELECT tk.HoTen, tk.Email AS EmailTK, tk.DienThoai AS SdtTK,
            bs.Email AS EmailBS, bs.SDT AS SdtBS
     FROM TaiKhoan tk
     LEFT JOIN BacSi bs ON bs.MaTaiKhoan = tk.MaTaiKhoan
     WHERE tk.MaTaiKhoan = ?
     LIMIT 1`,
    [maTaiKhoan]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    hoTen: r.HoTen || 'Người dùng',
    email: r.EmailTK || r.EmailBS || null,
    sdt: r.SdtTK || r.SdtBS || null
  };
}

async function sendEmail({ to, subject, text }) {
  if (!to) return { ok: false, reason: 'no_email' };
  if (!emailEnabled()) {
    console.log(`[Email:skip] → ${to} | ${subject}`);
    return { ok: false, reason: 'smtp_not_configured' };
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });
  return { ok: true };
}

async function sendSms({ to, body }) {
  if (!to) return { ok: false, reason: 'no_phone' };
  const phone = String(to).replace(/\s+/g, '');
  if (!smsEnabled()) {
    console.log(`[SMS:skip] → ${phone} | ${body}`);
    return { ok: false, reason: 'twilio_not_configured' };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');

  // Chuẩn hóa SĐT VN → E.164 nếu bắt đầu bằng 0
  let toE164 = phone;
  if (phone.startsWith('0')) toE164 = `+84${phone.slice(1)}`;
  else if (!phone.startsWith('+')) toE164 = `+${phone}`;

  const params = new URLSearchParams({
    To: toE164,
    From: from,
    Body: body.slice(0, 320)
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Twilio ${res.status}: ${errText}`);
  }
  return { ok: true };
}

/**
 * Gửi email + SMS theo MaTaiKhoan (không throw ra ngoài).
 */
async function guiThongBaoNgoai(maTaiKhoan, tieuDe, noiDung) {
  try {
    const contact = await getContact(maTaiKhoan);
    if (!contact) return;

    const text = `${tieuDe}\n\n${noiDung || ''}\n\n— Hệ thống Quản lý Bệnh viện`;
    const smsBody = `[BV] ${tieuDe}${noiDung ? `: ${noiDung}` : ''}`.slice(0, 320);

    const jobs = [];
    if (contact.email) {
      jobs.push(
        sendEmail({ to: contact.email, subject: `[BV] ${tieuDe}`, text })
          .catch((err) => console.error('Email error:', err.message))
      );
    }
    if (contact.sdt) {
      jobs.push(
        sendSms({ to: contact.sdt, body: smsBody })
          .catch((err) => console.error('SMS error:', err.message))
      );
    }
    await Promise.all(jobs);
  } catch (err) {
    console.error('guiThongBaoNgoai error:', err.message);
  }
}

module.exports = {
  emailEnabled,
  smsEnabled,
  sendEmail,
  sendSms,
  guiThongBaoNgoai
};
