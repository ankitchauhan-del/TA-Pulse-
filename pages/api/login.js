import crypto from 'crypto';
import { createSessionCookieValue, serializeSessionCookie } from '../../lib/auth';

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'Server not configured: DASHBOARD_PASSWORD missing' });
  }

  const submitted = (req.body && req.body.password) || '';
  if (!submitted || !safeEqual(submitted, expected)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const cookieValue = createSessionCookieValue();
  res.setHeader('Set-Cookie', serializeSessionCookie(cookieValue));
  return res.status(200).json({ ok: true });
}
