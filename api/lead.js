// /api/lead.js - Vercel serverless proxy (frameworkless Node runtime).
// Browser -> POST /api/lead (same origin) -> this -> Apps Script (token added server-side).
// Env vars (Vercel project settings): APPS_SCRIPT_URL, LEAD_TOKEN

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.LEAD_TOKEN;
  if (!url || !token) return res.status(500).json({ ok: false });

  const body = req.body || {};
  const payload = JSON.stringify({
    token: token,
    name: String(body.fullname || '').slice(0, 120),
    phone: String(body.phone || '').slice(0, 30),
    topic: String(body.topic || '').slice(0, 120),
    website: String(body._honey || ''), // honeypot mirror - Apps Script re-checks
    request_id: String(body.request_id || '').slice(0, 64) // idempotency key per submission attempt
  });

  try {
    // מסגרת הזמן חייבת לכסות ריצת Apps Script איטית (נמדדה ריצה של ~5 דקות בעומס גוגל).
    // 55 שניות + maxDuration 60 ב-vercel.json; מעבר לכך הלקוח מנסה שוב עם אותו request_id.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);

    // Apps Script answers /exec with a 302 to script.googleusercontent.com.
    // Follow the 302 manually (see postFollowingRedirects).
    let r = await postFollowingRedirects(url, payload, controller.signal);
    clearTimeout(timer);

    const data = await r.json().catch(() => null);
    if (r.ok && data && data.ok === true) return res.status(200).json({ ok: true });
    // סטטוסים מובחנים כדי שהלקוח ידע אם ניסיון חוזר עם אותו request_id יכול להתכנס להצלחה:
    // busy/timeout/502 - זמני, יש לנסות שוב; unauthorized/invalid_input - קבוע.
    if (data && data.ok === false && data.error === 'busy') return res.status(409).json({ ok: false, reason: 'busy' });
    if (data && data.ok === false && data.error === 'unauthorized') return res.status(401).json({ ok: false, reason: 'unauthorized' });
    if (data && data.ok === false && data.error === 'invalid_input') return res.status(400).json({ ok: false, reason: 'invalid_input' });
    return res.status(502).json({ ok: false });
  } catch (e) {
    // timeout (abort) או כשל רשת מול Apps Script: תוצאה לא ידועה - הריצה בגוגל עשויה להימשך ולהשלים.
    if (e && e.name === 'AbortError') return res.status(504).json({ ok: false, reason: 'timeout' });
    return res.status(502).json({ ok: false });
  }
}

async function postFollowingRedirects(url, payload, signal) {
  // Verified behavior (tested 2026-11-04): Apps Script runs doPost on the initial
  // POST, then answers with a 302 to a script.googleusercontent.com "echo" URL
  // that serves the result via GET only (a re-POST there returns 405).
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    redirect: 'manual',
    signal
  });
  if (r.status >= 300 && r.status < 400) {
    const loc = r.headers.get('location');
    if (!loc) throw new Error('redirect without location');
    return fetch(loc, { method: 'GET', redirect: 'follow', signal });
  }
  return r;
}
