import { Redis } from '@upstash/redis';
import { readSessionFromReq } from '../../lib/auth';

const KEY = 'ta-pulse:roles';

export default async function handler(req, res) {
  // Gate every data request behind a valid session.
  if (!readSessionFromReq(req)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let redis;
  try {
    redis = Redis.fromEnv();
  } catch (e) {
    return res.status(500).json({ error: 'Redis client failed to initialize — check env vars', detail: String((e && e.message) || e) });
  }

  if (req.method === 'GET') {
    try {
      const value = await redis.get(KEY);
      return res.status(200).json({ value: value ?? null });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read roles', detail: String((e && e.message) || e) });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      await redis.set(KEY, body.value);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save roles', detail: String((e && e.message) || e) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method not allowed');
}
