import { Redis } from '@upstash/redis';
import { readSessionFromReq } from '../../lib/auth';

const KEY = 'ta-pulse:roles';

// Canonical Google Sheet URLs, keyed by the label each role's source sheet carries.
const SHEET_URLS = {
  'Open_Roles_-_Status.xlsx': 'https://docs.google.com/spreadsheets/d/117O005N_hccgK-Yt8Ag8cv0uREXo7ix4CPuJ2_EW1ZI/edit?gid=0#gid=0',
  'Sr__Business_Data_Analyst.xlsx': 'https://docs.google.com/spreadsheets/d/1nYQhxXtGYNDnxZX0WuK149i5-Ga18pa4YJJ4B44_7nI/edit?gid=0#gid=0',
  'Backend_Candidates_-_2026.xlsx': 'https://docs.google.com/spreadsheets/d/1KeHE0vCfFXhse5JTiVbRvscj3bzmqFVB0yeVEo97000/edit?gid=1705877098#gid=1705877098',
  'AI_Candidates.xlsx': 'https://docs.google.com/spreadsheets/d/1oe7T84OCaXhFHX5qkkdcoISV4NbzKPhUdWjD8vyVjEw/edit?gid=0#gid=0',
  'Frontend_Candidates_-_2026.xlsx': 'https://docs.google.com/spreadsheets/d/1lp64kZo3BU3TmKNnPrYQpj2qTTroJwRXUlr5p5NCBkg/edit?gid=942518231#gid=942518231',
  'Company_Secretary.xlsx': 'https://docs.google.com/spreadsheets/d/1T3zostX824WkdBkqEdM4W_o3c2dakwXHQlCWp9DE3FI/edit?gid=0#gid=0',
};

// Map a role title -> which sheet label(s) it should link to. Mirrors the app's seed mapping.
const ROLE_SHEETS = {
  'Principal Product Designer': ['Open_Roles_-_Status.xlsx'],
  'Content Strategist': ['Open_Roles_-_Status.xlsx'],
  'Senior Business Analyst': ['Sr__Business_Data_Analyst.xlsx', 'Open_Roles_-_Status.xlsx'],
  'UX Writer': ['Open_Roles_-_Status.xlsx'],
  'QA Ops Associate': ['Open_Roles_-_Status.xlsx'],
  'Engineering Manager - Backend': ['Backend_Candidates_-_2026.xlsx'],
  'Senior AI Engineer': ['AI_Candidates.xlsx'],
  'AI Intern': ['AI_Candidates.xlsx'],
  'Sr.UI/UX Designer': ['Open_Roles_-_Status.xlsx'],
  'Sr.Graphic Designer': ['Open_Roles_-_Status.xlsx'],
  'Technical Lead - Frontend': ['Frontend_Candidates_-_2026.xlsx'],
  'Sr. Frontend Engineer': ['Frontend_Candidates_-_2026.xlsx'],
  'Company Secretary': ['Company_Secretary.xlsx'],
  'Manager - Strategy & Operations': [],
};

export default async function handler(req, res) {
  if (!readSessionFromReq(req)) {
    return res.status(401).json({ error: 'Not authenticated — open this while logged in.' });
  }

  let redis;
  try {
    redis = Redis.fromEnv();
  } catch (e) {
    return res.status(500).json({ error: 'Redis init failed', detail: String((e && e.message) || e) });
  }

  let roles;
  try {
    roles = await redis.get(KEY);
  } catch (e) {
    return res.status(500).json({ error: 'Could not read roles', detail: String((e && e.message) || e) });
  }

  if (!Array.isArray(roles)) {
    return res.status(200).json({ ok: false, message: 'No saved roles found to fix (database may be empty).' });
  }

  const report = [];
  for (const r of roles) {
    const labels = ROLE_SHEETS[r.title];
    if (labels === undefined) {
      report.push(`${r.title}: no mapping (left unchanged)`);
      continue;
    }
    const newSheets = labels.map(label => ({ label, path: SHEET_URLS[label] }));
    const before = JSON.stringify(r.sourceSheets || []);
    r.sourceSheets = newSheets;
    const after = JSON.stringify(newSheets);
    report.push(`${r.title}: ${before === after ? 'already correct' : 'updated -> ' + labels.join(', ')}`);
  }

  if (req.method !== 'POST') {
    // Dry run: show what WOULD change, without saving.
    return res.status(200).json({
      ok: true,
      mode: 'preview (nothing saved yet)',
      note: 'Everything looks right? Re-open this same URL but it must be a POST to actually save. Easiest: use the button on /fix-sheets.',
      report,
    });
  }

  try {
    await redis.set(KEY, roles);
  } catch (e) {
    return res.status(500).json({ error: 'Could not save roles', detail: String((e && e.message) || e) });
  }

  return res.status(200).json({ ok: true, mode: 'SAVED', report });
}
