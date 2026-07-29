import crypto from 'crypto';

// The cookie value is: base64(payload).hmac  where payload = {v:1, iat: <issued-at-ms>}
// It carries no secret itself; it's just a tamper-proof "this browser entered the right
// password at time T" token, signed with SESSION_SECRET so it can't be forged.

const COOKIE_NAME = 'tap_session';
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
}

export function createSessionCookieValue() {
  const payload = { v: 1, iat: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function isValidSessionValue(value) {
  if (!value || typeof value !== 'string' || !value.includes('.')) return false;
  const [payloadB64, sig] = value.split('.');
  if (!payloadB64 || !sig) return false;

  // constant-time signature check
  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.iat || (Date.now() - payload.iat) > MAX_AGE_MS) return false;
    return true;
  } catch {
    return false;
  }
}

export function readSessionFromReq(req) {
  const raw = req.headers.cookie || '';
  const match = raw.split(';').map(c => c.trim()).find(c => c.startsWith(COOKIE_NAME + '='));
  if (!match) return false;
  const value = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
  return isValidSessionValue(value);
}

export function serializeSessionCookie(value) {
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${Math.floor(MAX_AGE_MS / 1000)}`,
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

export function serializeClearCookie() {
  const attrs = [
    `${COOKIE_NAME}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

export { COOKIE_NAME };
